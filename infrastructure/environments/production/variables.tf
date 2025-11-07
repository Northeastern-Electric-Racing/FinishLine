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

variable "allowed_ips" {
  description = "List of IP addresses (in CIDR notation) allowed to access RDS directly. Leave empty for no direct access."
  type        = list(string)
  default     = []
  
  # Example:
  # allowed_ips = [
  #   "73.123.45.67/32",  # Your home IP
  #   "52.98.76.54/32"    # Your office IP
  # ]
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
  description = "Whether RDS should be publicly accessible"
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
  description = "Enable HTTPS with ACM certificate. Requires domain_name to be set."
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Custom domain name for the application (e.g., app.yourdomain.com). Leave empty to disable custom domain."
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
