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

variable "alb_arn_suffix" {
  description = "Application Load Balancer ARN suffix for metrics"
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

variable "sns_topic_arn" {
  description = "ARN of the SNS topic for alarm notifications. Leave empty to create alarms without notifications (e.g. for a temporary environment nobody should get paged for)."
  type        = string
  default     = ""
}

variable "alb_target_group_arn_suffix" {
  description = "ALB target group ARN suffix (targetgroup/name/id) for healthy host metrics. Leave empty to skip the app health widget."
  type        = string
  default     = ""
}

variable "rds_vcpu_count" {
  description = "vCPU count of the RDS instance class, drawn as the saturation line on the DB Load graph (db.t4g.medium = 2)"
  type        = number
  default     = 2
}

variable "extra_alarm_arns" {
  description = "ARNs of alarms defined outside this module (e.g. in the RDS module) to show in the dashboard alarm status widget"
  type        = list(string)
  default     = []
}
