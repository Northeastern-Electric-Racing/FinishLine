# Bootstrap Variables

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "state_bucket_name" {
  description = "Name of the S3 bucket for Terraform state storage"
  type        = string
  default     = "finishline-terraform-state"
}

variable "locks_table_name" {
  description = "Name of the DynamoDB table for state locking"
  type        = string
  default     = "finishline-terraform-locks"
}

variable "eb_versions_bucket_name" {
  description = "Name of the S3 bucket for Elastic Beanstalk application versions"
  type        = string
  default     = "finishline-eb-versions"
}

