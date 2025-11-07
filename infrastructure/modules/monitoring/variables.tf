# Monitoring Module Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., production, staging)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "eb_environment_name" {
  description = "Elastic Beanstalk environment name"
  type        = string
}

variable "eb_autoscaling_group_name" {
  description = "Elastic Beanstalk autoscaling group name"
  type        = string
}

variable "rds_instance_id" {
  description = "RDS instance ID"
  type        = string
}

variable "log_retention_days" {
  description = "Number of days to retain logs"
  type        = number
  default     = 7
}
