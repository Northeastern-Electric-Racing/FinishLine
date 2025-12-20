# RDS Module Outputs

output "db_instance_id" {
  description = "The RDS instance identifier (for CloudWatch metrics)"
  value       = aws_db_instance.main.identifier
}

output "db_instance_resource_id" {
  description = "The RDS instance resource ID (DbiResourceId)"
  value       = aws_db_instance.main.id
}

output "db_instance_arn" {
  description = "The ARN of the RDS instance"
  value       = aws_db_instance.main.arn
}

output "db_instance_endpoint" {
  description = "The connection endpoint"
  value       = aws_db_instance.main.endpoint
}

output "db_instance_address" {
  description = "The hostname of the RDS instance"
  value       = aws_db_instance.main.address
}

output "db_instance_port" {
  description = "The database port"
  value       = aws_db_instance.main.port
}

output "db_instance_name" {
  description = "The database name"
  value       = aws_db_instance.main.db_name
}

output "db_instance_username" {
  description = "The master username for the database"
  value       = aws_db_instance.main.username
  sensitive   = true
}

output "database_url" {
  description = "The complete database URL (format: postgresql://user:pass@host:port/dbname)"
  value       = "postgresql://${aws_db_instance.main.username}:${var.master_password}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
  sensitive   = true
}
