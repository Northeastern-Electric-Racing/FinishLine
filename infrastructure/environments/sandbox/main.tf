# Sandbox Environment - Main Configuration
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
    key            = "sandbox/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "finishline-terraform-locks"
  }
}

provider "aws" {
  region = "us-east-2"

  default_tags {
    tags = {
      Project     = "finishline"
      Environment = "sandbox"
      ManagedBy   = "Terraform"
    }
  }
}

#############
# Network Module
#############
module "network" {
  source = "../../modules/network"

  project_name = "finishline"
  environment  = "sandbox"
  aws_region   = "us-east-2"
  vpc_cidr     = "10.1.0.0/16"
}

#############
# IAM Module
#############
module "iam" {
  source = "../../modules/iam"

  project_name          = "finishline"
  environment           = "sandbox"
  aws_region            = "us-east-2"
  create_cloudfront_oai = false
}

#############
# RDS Module
#############
module "rds" {
  source = "../../modules/rds"

  project_name = "finishline"
  environment  = "sandbox"

  # Network
  db_subnet_group_name = module.network.db_subnet_group_name
  security_group_id    = module.network.rds_security_group_id

  # Instance config - downsized for sandbox
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  # Sandbox-specific: no backups, no deletion protection, no final snapshot
  backup_retention_period = 0
  deletion_protection     = false
  skip_final_snapshot     = true
  alarm_actions           = []

  # Restore from a prod snapshot when provided (passed in by CI/CD pipeline)
  snapshot_identifier     = var.snapshot_identifier

  # Credentials
  database_name   = "finishline"
  master_username = "finishline"
  master_password = var.db_master_password
}

#############
# Elastic Beanstalk Module
#############
module "elasticbeanstalk" {
  source = "../../modules/elasticbeanstalk"

  project_name = "finishline"
  environment  = "sandbox"
  vpc_id       = module.network.vpc_id
  subnet_ids   = module.network.public_subnet_ids
  elb_subnet_ids = module.network.public_subnet_ids

  # IAM
  instance_profile_name = module.iam.eb_ec2_instance_profile_name
  eb_service_role_name  = module.iam.eb_service_role_name
  eb_service_role_arn   = module.iam.eb_service_role_arn

  # Security
  instance_security_group_id = module.network.eb_instance_security_group_id
  alb_security_group_id      = module.network.alb_security_group_id

  # Sandbox-specific: single instance, fast deploys, no HTTPS
  min_instance_count = 1
  max_instance_count = 1
  deployment_policy  = "AllAtOnce"
  enable_https       = false
  health_check_path  = "/health"
  log_retention_days = 7

  environment_variables = {
    DATABASE_URL = module.rds.database_url

    SESSION_SECRET               = var.session_secret
    ENCRYPTION_KEY               = var.encryption_key
    GOOGLE_CLIENT_SECRET         = var.google_client_secret
    DRIVE_REFRESH_TOKEN          = var.drive_refresh_token
    CALENDAR_REFRESH_TOKEN       = var.calendar_refresh_token
    SLACK_BOT_TOKEN              = var.slack_bot_token
    SLACK_TOKEN_SECRET           = var.slack_token_secret
    SLACK_SIGNING_SECRET         = var.slack_signing_secret
    NOTIFICATION_ENDPOINT_SECRET = var.notification_endpoint_secret

    LOG_LEVEL                            = "info"
    GOOGLE_CLIENT_ID                     = var.google_client_id
    REACT_APP_GOOGLE_AUTH_CLIENT_ID      = var.google_client_id
    GOOGLE_DRIVE_FOLDER_ID               = var.google_drive_folder_id
    SLACK_ID                             = var.slack_id
    USER_EMAIL                           = var.user_email
    ADMIN_USER_ID                        = var.admin_user_id
  }
}

#############
# CloudWatch Log Group (skip full monitoring module — no dashboards or alarms needed for sandbox)
#############
resource "aws_cloudwatch_log_group" "eb_logs" {
  name              = "/aws/elasticbeanstalk/finishline-sandbox"
  retention_in_days = 7

  tags = {
    Name = "finishline-sandbox-eb-logs"
  }
}