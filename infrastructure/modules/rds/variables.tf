# RDS Module Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., production, staging)"
  type        = string
}

variable "instance_class" {
  description = "The instance type of the RDS instance"
  type        = string
  default     = "db.t4g.medium"
}

variable "allocated_storage" {
  description = "The allocated storage in gigabytes"
  type        = number
  default     = 20
}

variable "storage_type" {
  description = "One of 'standard' (magnetic), 'gp2' (general purpose SSD), or 'io1' (provisioned IOPS SSD)"
  type        = string
  default     = "gp2"
}

variable "postgres_version" {
  description = "PostgreSQL major version (minor versions auto-update)"
  type        = string
  default     = "16"
}

variable "database_name" {
  description = "The name of the database to create"
  type        = string
}

variable "master_username" {
  description = "Username for the master DB user"
  type        = string
  default     = "postgres"
}

variable "master_password" {
  description = "Password for the master DB user"
  type        = string
  sensitive   = true
}

variable "db_subnet_group_name" {
  description = "Name of DB subnet group"
  type        = string
}

variable "security_group_id" {
  description = "Security group ID for RDS"
  type        = string
}

variable "publicly_accessible" {
  description = "Bool to control if instance is publicly accessible"
  type        = bool
  default     = false
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment for high availability (creates standby replica in different AZ)"
  type        = bool
  default     = false
}

variable "backup_retention_period" {
  description = "The days to retain backups for"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "The daily time range during which automated backups are created"
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "The window to perform maintenance in"
  type        = string
  default     = "Mon:04:00-Mon:05:00"
}

variable "deletion_protection" {
  description = "If the DB instance should have deletion protection enabled"
  type        = bool
  default     = true
}

variable "performance_insights_enabled" {
  description = "Specifies whether Performance Insights are enabled"
  type        = bool
  default     = false
}

variable "alarm_actions" {
  description = "List of ARNs to notify when alarm triggers"
  type        = list(string)
  default     = []
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on destroy (set true for ephemeral environments)"
  type        = bool
  default     = false
}

variable "snapshot_identifier" {
  description = "Snapshot ID to restore from on creation (leave null for a fresh database)"
  type        = string
  default     = null
}
