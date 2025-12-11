# Secrets Module Outputs

#############
# Database Password
#############
output "db_password_secret_arn" {
  description = "ARN of the database password secret"
  value       = aws_secretsmanager_secret.db_password.arn
}

output "db_password_secret_name" {
  description = "Name of the database password secret"
  value       = aws_secretsmanager_secret.db_password.name
}

output "db_password" {
  description = "Database password value (sensitive)"
  value       = aws_secretsmanager_secret_version.db_password.secret_string
  sensitive   = true
}

#############
# Session Secret
#############
output "session_secret_arn" {
  description = "ARN of the session secret"
  value       = aws_secretsmanager_secret.session_secret.arn
}

output "session_secret_name" {
  description = "Name of the session secret"
  value       = aws_secretsmanager_secret.session_secret.name
}

output "session_secret" {
  description = "Session secret value (sensitive)"
  value       = aws_secretsmanager_secret_version.session_secret.secret_string
  sensitive   = true
}

#############
# Google Client Secret
#############
output "google_client_secret_arn" {
  description = "ARN of the Google client secret"
  value       = aws_secretsmanager_secret.google_client_secret.arn
}

output "google_client_secret" {
  description = "Google client secret value (sensitive)"
  value       = aws_secretsmanager_secret_version.google_client_secret.secret_string
  sensitive   = true
}

#############
# Drive Refresh Token
#############
output "drive_refresh_token_arn" {
  description = "ARN of the Drive refresh token"
  value       = aws_secretsmanager_secret.drive_refresh_token.arn
}

output "drive_refresh_token" {
  description = "Drive refresh token value (sensitive)"
  value       = aws_secretsmanager_secret_version.drive_refresh_token.secret_string
  sensitive   = true
}

#############
# Encryption Key
#############
output "encryption_key_arn" {
  description = "ARN of the encryption key"
  value       = aws_secretsmanager_secret.encryption_key.arn
}

output "encryption_key" {
  description = "Encryption key value (sensitive)"
  value       = aws_secretsmanager_secret_version.encryption_key.secret_string
  sensitive   = true
}

#############
# Slack Bot Token
#############
output "slack_bot_token_arn" {
  description = "ARN of the Slack bot token"
  value       = aws_secretsmanager_secret.slack_bot_token.arn
}

output "slack_bot_token" {
  description = "Slack bot token value (sensitive)"
  value       = aws_secretsmanager_secret_version.slack_bot_token.secret_string
  sensitive   = true
}

#############
# Slack Token Secret
#############
output "slack_token_secret_arn" {
  description = "ARN of the Slack token secret"
  value       = aws_secretsmanager_secret.slack_token_secret.arn
}

output "slack_token_secret" {
  description = "Slack token secret value (sensitive)"
  value       = aws_secretsmanager_secret_version.slack_token_secret.secret_string
  sensitive   = true
}

#############
# Slack Signing Secret
#############
output "slack_signing_secret_arn" {
  description = "ARN of the Slack signing secret"
  value       = aws_secretsmanager_secret.slack_signing_secret.arn
}

output "slack_signing_secret" {
  description = "Slack signing secret value (sensitive)"
  value       = aws_secretsmanager_secret_version.slack_signing_secret.secret_string
  sensitive   = true
}

#############
# Notification Endpoint Secret
#############
output "notification_endpoint_secret_arn" {
  description = "ARN of the notification endpoint secret"
  value       = aws_secretsmanager_secret.notification_endpoint_secret.arn
}

output "notification_endpoint_secret" {
  description = "Notification endpoint secret value (sensitive)"
  value       = aws_secretsmanager_secret_version.notification_endpoint_secret.secret_string
  sensitive   = true
}

#############
# Calendar Refresh Token
#############
output "calendar_refresh_token_arn" {
  description = "ARN of the calendar refresh token"
  value       = aws_secretsmanager_secret.calendar_refresh_token.arn
}

output "calendar_refresh_token" {
  description = "Calendar refresh token value (sensitive)"
  value       = aws_secretsmanager_secret_version.calendar_refresh_token.secret_string
  sensitive   = true
}
