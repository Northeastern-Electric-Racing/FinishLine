# Secrets Module - AWS Secrets Manager

#############
# Database Password Secret
#############
resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${var.project_name}/${var.environment}/db-password"
  description             = "RDS master password for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-password"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_master_password
}

#############
# Session Secret
#############
resource "aws_secretsmanager_secret" "session_secret" {
  name                    = "${var.project_name}/${var.environment}/session-secret"
  description             = "Session secret for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-session-secret"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret_version" "session_secret" {
  secret_id     = aws_secretsmanager_secret.session_secret.id
  secret_string = var.session_secret
}

#############
# Google Client Secret
#############
resource "aws_secretsmanager_secret" "google_client_secret" {
  name                    = "${var.project_name}/${var.environment}/google-client-secret"
  description             = "Google OAuth client secret for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-google-client-secret"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret_version" "google_client_secret" {
  secret_id     = aws_secretsmanager_secret.google_client_secret.id
  secret_string = var.google_client_secret
}

#############
# Google Drive Refresh Token
#############
resource "aws_secretsmanager_secret" "drive_refresh_token" {
  name                    = "${var.project_name}/${var.environment}/drive-refresh-token"
  description             = "Google Drive refresh token for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-drive-refresh-token"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret_version" "drive_refresh_token" {
  secret_id     = aws_secretsmanager_secret.drive_refresh_token.id
  secret_string = var.drive_refresh_token
}

#############
# Encryption Key
#############
resource "aws_secretsmanager_secret" "encryption_key" {
  name                    = "${var.project_name}/${var.environment}/encryption-key"
  description             = "Application encryption key for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-encryption-key"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret_version" "encryption_key" {
  secret_id     = aws_secretsmanager_secret.encryption_key.id
  secret_string = var.encryption_key
}

#############
# Slack Bot Token
#############
resource "aws_secretsmanager_secret" "slack_bot_token" {
  name                    = "${var.project_name}/${var.environment}/slack-bot-token"
  description             = "Slack bot token for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-slack-bot-token"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret_version" "slack_bot_token" {
  secret_id     = aws_secretsmanager_secret.slack_bot_token.id
  secret_string = var.slack_bot_token
}

#############
# Slack Token Secret
#############
resource "aws_secretsmanager_secret" "slack_token_secret" {
  name                    = "${var.project_name}/${var.environment}/slack-token-secret"
  description             = "Slack OAuth token secret for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-slack-token-secret"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret_version" "slack_token_secret" {
  secret_id     = aws_secretsmanager_secret.slack_token_secret.id
  secret_string = var.slack_token_secret
}

#############
# Slack Signing Secret
#############
resource "aws_secretsmanager_secret" "slack_signing_secret" {
  name                    = "${var.project_name}/${var.environment}/slack-signing-secret"
  description             = "Slack signing secret for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-slack-signing-secret"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret_version" "slack_signing_secret" {
  secret_id     = aws_secretsmanager_secret.slack_signing_secret.id
  secret_string = var.slack_signing_secret
}

#############
# Notification Endpoint Secret
#############
resource "aws_secretsmanager_secret" "notification_endpoint_secret" {
  name                    = "${var.project_name}/${var.environment}/notification-endpoint-secret"
  description             = "Notification endpoint secret for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-notification-endpoint-secret"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret_version" "notification_endpoint_secret" {
  secret_id     = aws_secretsmanager_secret.notification_endpoint_secret.id
  secret_string = var.notification_endpoint_secret
}

#############
# Calendar Refresh Token
#############
resource "aws_secretsmanager_secret" "calendar_refresh_token" {
  name                    = "${var.project_name}/${var.environment}/calendar-refresh-token"
  description             = "Google Calendar refresh token for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-calendar-refresh-token"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret_version" "calendar_refresh_token" {
  secret_id     = aws_secretsmanager_secret.calendar_refresh_token.id
  secret_string = var.calendar_refresh_token
}
