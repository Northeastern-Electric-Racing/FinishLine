# Sandbox Environment Variables
# Most sandbox config is hardcoded (us-east-2, single instance, etc.)
# Only values that the CI/CD pipeline injects at runtime are variables.

#####################
# RDS Variables
#####################

variable "db_master_password" {
  description = "Master password for the sandbox database"
  type        = string
  sensitive   = true
  # Set via: export TF_VAR_db_master_password="..."
  # In CI/CD: generated once and stored in GitHub Actions secrets
}

variable "github_access_token" {
  description = "GitHub personal access token for Amplify to access the repository"
  type        = string
  sensitive   = true
}

variable "snapshot_identifier" {
  description = "RDS snapshot ID to restore from (taken from prod by the CI/CD pipeline before spin-up)"
  type        = string
  default     = null
  # When null, a fresh empty database is created instead
}

#####################
# Secrets (injected by CI/CD from prod Secrets Manager at pipeline run time)
#####################

variable "session_secret" {
  description = "Secret key for application session management"
  type        = string
  sensitive   = true
}

variable "encryption_key" {
  description = "Application encryption key"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
}

variable "drive_refresh_token" {
  description = "Google Drive refresh token"
  type        = string
  sensitive   = true
}

variable "calendar_refresh_token" {
  description = "Google Calendar refresh token"
  type        = string
  sensitive   = true
}

variable "slack_bot_token" {
  description = "Slack bot token"
  type        = string
  sensitive   = true
}

variable "slack_token_secret" {
  description = "Slack OAuth token secret"
  type        = string
  sensitive   = true
}

variable "slack_signing_secret" {
  description = "Slack signing secret for request verification"
  type        = string
  sensitive   = true
}

variable "notification_endpoint_secret" {
  description = "Secret for notification endpoint authentication"
  type        = string
  sensitive   = true
}

#####################
# Non-secret application config
#####################

variable "google_client_id" {
  description = "Google OAuth client ID (public)"
  type        = string
  default     = ""
}

variable "google_drive_folder_id" {
  description = "Google Drive folder ID"
  type        = string
  default     = ""
}

variable "slack_id" {
  description = "Slack app ID"
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
