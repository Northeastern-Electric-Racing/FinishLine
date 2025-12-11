# Secrets Module Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., production, staging)"
  type        = string
}

variable "db_master_password" {
  description = "Master password for the database"
  type        = string
  sensitive   = true
}

variable "session_secret" {
  description = "Secret key for session management"
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

variable "encryption_key" {
  description = "Application encryption key"
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

variable "calendar_refresh_token" {
  description = "Google Calendar refresh token"
  type        = string
  sensitive   = true
}
