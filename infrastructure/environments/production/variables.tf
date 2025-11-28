# Production Environment Variables

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "finishline"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

#####################
# Network Variables
#####################

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

#####################
# RDS Variables
#####################

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.medium"
}

variable "rds_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20
}

variable "postgres_version" {
  description = "PostgreSQL major version (minor versions auto-update)"
  type        = string
  default     = "16"
}

variable "database_name" {
  description = "Name of the database"
  type        = string
  default     = "finishline"
}

variable "db_master_username" {
  description = "Master username for the database"
  type        = string
  default     = "postgres"
}

variable "rds_publicly_accessible" {
  description = "Whether RDS should be publicly accessible (should always be false for production)"
  type        = bool
  default     = false
}

variable "rds_multi_az" {
  description = "Enable Multi-AZ for RDS (high availability with automatic failover). Doubles RDS cost."
  type        = bool
  default     = false
}

#####################
# Elastic Beanstalk Variables
#####################

variable "eb_instance_type" {
  description = "EC2 instance type for Elastic Beanstalk"
  type        = string
  default     = "t3.small"
}

variable "eb_min_instances" {
  description = "Minimum number of EC2 instances"
  type        = number
  default     = 1
}

variable "eb_max_instances" {
  description = "Maximum number of EC2 instances"
  type        = number
  default     = 4
}

variable "eb_solution_stack" {
  description = "Elastic Beanstalk solution stack name"
  type        = string
  default     = ""  # Empty means use module default
}

#####################
# HTTPS/SSL Variables
#####################

variable "enable_https" {
  description = "Enable HTTPS with ACM certificate. Requires use_custom_domain to be true."
  type        = bool
  default     = false
}

variable "use_custom_domain" {
  description = "Use custom domain names for frontend and backend"
  type        = bool
  default     = false
}

variable "hosted_zone_name" {
  description = "Route53 hosted zone name"
  type        = string
  default     = "finishlinebyner.com"
}

variable "frontend_domain" {
  description = "Custom domain for frontend"
  type        = string
  default     = "qa.finishlinebyner.com"
}

variable "backend_domain" {
  description = "Custom domain for backend"
  type        = string
  default     = "api-qa.finishlinebyner.com"
}

# Legacy variable - kept for backwards compatibility
variable "domain_name" {
  description = "DEPRECATED: Use frontend_domain instead"
  type        = string
  default     = ""
}

#####################
# Secrets (Set via TF_VAR_* environment variables)
#####################

variable "db_master_password" {
  description = "Master password for the database"
  type        = string
  sensitive   = true
  # Set via: export TF_VAR_db_master_password="your-password"
}

variable "session_secret" {
  description = "Secret key for application session management"
  type        = string
  sensitive   = true
  # Set via: export TF_VAR_session_secret=$(openssl rand -base64 32)
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
  # Set via: export TF_VAR_google_client_secret="GOCSPX-xxxxx"
}

variable "drive_refresh_token" {
  description = "Google Drive refresh token"
  type        = string
  sensitive   = true
  # Set via: export TF_VAR_drive_refresh_token="1//xxxxx"
}

variable "encryption_key" {
  description = "Application encryption key"
  type        = string
  sensitive   = true
  # Set via: export TF_VAR_encryption_key=$(openssl rand -base64 32)
}

variable "slack_bot_token" {
  description = "Slack bot token"
  type        = string
  sensitive   = true
  # Set via: export TF_VAR_slack_bot_token="xoxb-xxxxx"
}

variable "slack_token_secret" {
  description = "Slack OAuth token secret"
  type        = string
  sensitive   = true
  # Set via: export TF_VAR_slack_token_secret="xxxxx"
}

variable "slack_signing_secret" {
  description = "Slack signing secret for request verification"
  type        = string
  sensitive   = true
  # Set via: export TF_VAR_slack_signing_secret="xxxxx"
}

variable "notification_endpoint_secret" {
  description = "Secret for notification endpoint authentication"
  type        = string
  sensitive   = true
  # Set via: export TF_VAR_notification_endpoint_secret=$(openssl rand -base64 32)
}

variable "calendar_refresh_token" {
  description = "Google Calendar refresh token"
  type        = string
  sensitive   = true
  # Set via: export TF_VAR_calendar_refresh_token="1//xxxxx"
}

#####################
# Frontend (Amplify) Variables
#####################

variable "github_repository" {
  description = "GitHub repository URL (e.g., https://github.com/username/FinishLine)"
  type        = string
  default     = ""  # Set this to your GitHub repo URL
}

variable "github_access_token" {
  description = "GitHub personal access token for Amplify to access the repository"
  type        = string
  sensitive   = true
  # Set via: export TF_VAR_github_access_token="ghp_xxxxx"
  # Create at: https://github.com/settings/tokens
  # Required scopes: repo (Full control of private repositories)
}

variable "deploy_branch_name" {
  description = "Branch name to deploy (use a test branch initially, then switch to 'main')"
  type        = string
  default     = "multitenancy"  # Change to 'main' when ready for production
}

variable "enable_pull_request_preview" {
  description = "Enable automatic preview deployments for pull requests"
  type        = bool
  default     = false # TODO: Enable this when we have PR previews set up
}

#####################
# Application Variables (Non-Secret)
#####################

variable "google_client_id" {
  description = "Google OAuth client ID (public)"
  type        = string
  default     = ""
}

variable "google_drive_folder_id" {
  description = "Google Drive folder ID for file storage"
  type        = string
  default     = ""
}

variable "slack_id" {
  description = "Slack app ID (public)"
  type        = string
  default     = ""
}

variable "user_email" {
  description = "Primary email address"
  type        = string
  default     = ""
}

variable "admin_user_id" {
  description = "Admin user ID"
  type        = string
  default     = ""
}
