# Production Environment - Main Configuration

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "finishline-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "finishline-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

locals {
  project_name = "finishline"
  environment  = "production"
}

#############
# Network Module
#############
module "network" {
  source = "../../modules/network"

  project_name = local.project_name
  environment  = local.environment
  aws_region   = var.aws_region
  vpc_cidr     = var.vpc_cidr
}

#############
# DNS Module (Certificates and Route53)
#############
module "dns" {
  # Only create if domain is configured
  count = var.use_custom_domain ? 1 : 0
  
  source = "../../modules/dns"

  project_name     = local.project_name
  environment      = local.environment
  hosted_zone_name = var.hosted_zone_name
  frontend_domain  = var.frontend_domain
  backend_domain   = var.backend_domain
  backend_cname    = module.elasticbeanstalk.environment_cname
}

#############
# IAM Module
#############
module "iam" {
  source = "../../modules/iam"

  project_name          = local.project_name
  environment           = local.environment
  aws_region            = var.aws_region
  create_cloudfront_oai = true
}

#############
# ECR Module
#############
module "ecr" {
  source = "../../modules/ecr"

  project_name = local.project_name
  environment  = local.environment
}

#############
# Secrets Module
#############
module "secrets" {
  source = "../../modules/secrets"

  project_name                  = local.project_name
  environment                   = local.environment
  db_master_password            = var.db_master_password
  session_secret                = var.session_secret
  google_client_secret          = var.google_client_secret
  drive_refresh_token           = var.drive_refresh_token
  encryption_key                = var.encryption_key
  slack_bot_token               = var.slack_bot_token
  slack_token_secret            = var.slack_token_secret
  slack_signing_secret          = var.slack_signing_secret
  notification_endpoint_secret  = var.notification_endpoint_secret
  calendar_refresh_token        = var.calendar_refresh_token
}

#############
# RDS Module
#############
module "rds" {
  source = "../../modules/rds"

  project_name         = local.project_name
  environment          = local.environment
  instance_class       = var.rds_instance_class
  allocated_storage    = var.rds_allocated_storage
  postgres_version     = var.postgres_version
  database_name        = var.database_name
  master_username      = var.db_master_username
  master_password      = module.secrets.db_password
  # Keep RDS in private subnets (best practice for production)
  db_subnet_group_name = module.network.db_subnet_group_name
  security_group_id    = module.network.rds_security_group_id
  publicly_accessible  = false  # Keep private for security
  multi_az             = var.rds_multi_az

  # Backup configuration
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  # Protection
  deletion_protection = true

  # Monitoring
  performance_insights_enabled = true
  # Note: Alarms will be created by monitoring module
  # alarm_actions = []  # Empty for now to avoid circular dependency
}

# Note: ACM Certificates are now created in the DNS module
# This ensures proper ordering and validation

#############
# Elastic Beanstalk Module
#############
module "elasticbeanstalk" {
  source = "../../modules/elasticbeanstalk"

  project_name       = local.project_name
  environment        = local.environment
  vpc_id             = module.network.vpc_id
  subnet_ids         = module.network.public_subnet_ids
  elb_subnet_ids     = module.network.public_subnet_ids

  # Instance configuration
  instance_type       = var.eb_instance_type
  min_instance_count  = var.eb_min_instances
  max_instance_count  = var.eb_max_instances

  # IAM
  instance_profile_name   = module.iam.eb_ec2_instance_profile_name
  eb_service_role_name    = module.iam.eb_service_role_name
  eb_service_role_arn     = module.iam.eb_service_role_arn

  # Security
  instance_security_group_id = module.network.eb_instance_security_group_id
  alb_security_group_id      = module.network.alb_security_group_id

  # Configuration
  deployment_policy  = "RollingWithAdditionalBatch"
  health_check_path  = "/health"
  log_retention_days = 30

  # HTTPS Configuration
  enable_https         = var.enable_https
  # Use backend certificate from DNS module if domain is configured
  ssl_certificate_arn  = var.use_custom_domain ? module.dns[0].backend_certificate_arn : ""

  # Environment variables
  environment_variables = {
    # Database connection (includes password)
    DATABASE_URL = module.rds.database_url
    
    # Secrets (actual values injected by Terraform)
    SESSION_SECRET             = module.secrets.session_secret
    ENCRYPTION_KEY             = module.secrets.encryption_key
    GOOGLE_CLIENT_SECRET       = module.secrets.google_client_secret
    DRIVE_REFRESH_TOKEN        = module.secrets.drive_refresh_token
    CALENDAR_REFRESH_TOKEN     = module.secrets.calendar_refresh_token
    SLACK_BOT_TOKEN            = module.secrets.slack_bot_token
    SLACK_TOKEN_SECRET         = module.secrets.slack_token_secret
    SLACK_SIGNING_SECRET       = module.secrets.slack_signing_secret
    NOTIFICATION_ENDPOINT_SECRET = module.secrets.notification_endpoint_secret
    
    # Non-secret configuration
    NODE_ENV                   = "production"
    LOG_LEVEL                  = "info"
    GOOGLE_CLIENT_ID           = var.google_client_id
    REACT_APP_GOOGLE_AUTH_CLIENT_ID = var.google_client_id  # Required by OAuth2Client
    GOOGLE_DRIVE_FOLDER_ID     = var.google_drive_folder_id
    SLACK_ID                   = var.slack_id
    USER_EMAIL                 = var.user_email
    ADMIN_USER_ID              = var.admin_user_id
  }
}

#############
# Frontend Module (Amplify - GitHub Integration)
#############
module "frontend" {
  source = "../../modules/amplify-frontend"

  project_name         = local.project_name
  environment          = local.environment
  
  # GitHub configuration
  github_repository    = var.github_repository
  github_access_token  = var.github_access_token
  
  # Deploy from a test branch for now (change to "main" when ready for production)
  main_branch_name     = var.deploy_branch_name
  
  # Backend API URL - use custom domain if configured, otherwise EB default
  backend_api_url      = var.use_custom_domain ? module.dns[0].backend_url : module.elasticbeanstalk.environment_endpoint_url
  
  # Disable PR previews for now (enable later when ready)
  enable_pull_request_preview = var.enable_pull_request_preview
  
  # Custom domain configuration
  domain_name   = var.use_custom_domain ? var.frontend_domain : ""
  domain_prefix = ""  # Empty since we're using the full domain (qa.finishlinebyner.com)
  
  # Additional environment variables for frontend build
  additional_environment_variables = {
    VITE_REACT_APP_GOOGLE_AUTH_CLIENT_ID = var.google_client_id
  }
}

#############
# Monitoring Module
#############
module "monitoring" {
  source = "../../modules/monitoring"

  project_name               = local.project_name
  environment                = local.environment
  aws_region                 = var.aws_region
  eb_environment_name        = module.elasticbeanstalk.environment_name
  eb_autoscaling_group_name  = module.elasticbeanstalk.autoscaling_groups[0]
  rds_instance_id            = module.rds.db_instance_id
  log_retention_days         = 30
}
