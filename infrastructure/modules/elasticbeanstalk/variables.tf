# Elastic Beanstalk Module Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., production, staging)"
  type        = string
}

variable "solution_stack_name" {
  description = "Elastic Beanstalk solution stack name. Leave empty to auto-detect the latest matching Docker stack (see the data source below) - AWS periodically deprecates specific patch versions, so pinning one here will eventually break CreateEnvironment with 'No Solution Stack named ... found' (as v4.11.0 just did)."
  type        = string
  default     = ""
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for EC2 instances"
  type        = list(string)
}

variable "elb_subnet_ids" {
  description = "List of subnet IDs for the load balancer"
  type        = list(string)
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "min_instance_count" {
  description = "Minimum number of instances"
  type        = number
  default     = 1
}

variable "max_instance_count" {
  description = "Maximum number of instances"
  type        = number
  default     = 4
}

variable "instance_profile_name" {
  description = "IAM instance profile name"
  type        = string
}

variable "eb_service_role_name" {
  description = "Elastic Beanstalk service role name"
  type        = string
}

variable "eb_service_role_arn" {
  description = "Elastic Beanstalk service role ARN"
  type        = string
}

variable "instance_security_group_id" {
  description = "Security group ID for EC2 instances"
  type        = string
}

variable "alb_security_group_id" {
  description = "Security group ID for Application Load Balancer"
  type        = string
}

variable "deployment_policy" {
  description = "Deployment policy (Rolling, RollingWithAdditionalBatch, Immutable)"
  type        = string
  default     = "RollingWithAdditionalBatch"
}

variable "health_check_path" {
  description = "Path for health check"
  type        = string
  default     = "/health"
}

variable "log_retention_days" {
  description = "Number of days to retain logs"
  type        = number
  default     = 7
}

variable "retain_logs_on_terminate" {
  description = "Keep CloudWatch logs (until log_retention_days expires) after the environment is terminated, instead of deleting them immediately. Needed for post-mortem debugging of a failed deployment after teardown."
  type        = bool
  default     = false
}

variable "environment_variables" {
  description = "Map of environment variables"
  type        = map(string)
  default     = {}
}

variable "enable_https" {
  description = "Enable HTTPS listener on ALB"
  type        = bool
  default     = false
}

variable "ssl_certificate_arn" {
  description = "ARN of SSL certificate for HTTPS listener"
  type        = string
  default     = ""
}

variable "cname_prefix" {
  description = "Fixed CNAME prefix for the environment (e.g. 'finishline-sandbox'). Leave empty to let AWS assign a random one. Set this when a backend ACM cert needs a CNAME known before the environment exists, to avoid a dependency cycle."
  type        = string
  default     = ""
}

variable "ec2_key_name" {
  description = "Name of the EC2 key pair for SSH access (leave empty to disable SSH)"
  type        = string
  default     = ""
}
