# DNS Module Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "hosted_zone_name" {
  description = "Name of the Route53 hosted zone (e.g., finishlinebyner.com)"
  type        = string
}

variable "frontend_domain" {
  description = "Frontend domain name (e.g., finishlinebyner.com)"
  type        = string
}

variable "backend_domain" {
  description = "Backend domain name (e.g., api-finishlinebyner.com)"
  type        = string
}

variable "backend_cname" {
  description = "Elastic Beanstalk CNAME to point backend domain to"
  type        = string
}
