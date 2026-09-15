# IAM Module Variables

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

variable "create_cloudfront_oai" {
  description = "Whether to create CloudFront Origin Access Identity"
  type        = bool
  default     = false
}
