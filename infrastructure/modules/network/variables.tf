# Network Module Variables

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

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "allowed_ips" {
  description = "List of IP addresses (in CIDR notation) allowed to access RDS directly"
  type        = list(string)
  default     = []
  
  validation {
    condition = alltrue([
      for ip in var.allowed_ips : can(regex("^([0-9]{1,3}\\.){3}[0-9]{1,3}/[0-9]{1,2}$", ip))
    ])
    error_message = "IPs must be in CIDR notation (e.g., '192.168.1.1/32')"
  }
}
