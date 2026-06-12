# Sandbox Environment Outputs
# These are consumed by the CI/CD pipeline after terraform apply.

#####################
# Network Outputs
#####################

output "vpc_id" {
  description = "VPC ID"
  value       = module.network.vpc_id
}

#####################
# RDS Outputs
#####################

output "rds_endpoint" {
  description = "RDS endpoint (host:port)"
  value       = module.rds.db_instance_endpoint
}

output "rds_address" {
  description = "RDS hostname"
  value       = module.rds.db_instance_address
}

output "database_url" {
  description = "Full database connection URL (used by CI/CD to write the sandbox DATABASE_URL secret)"
  value       = module.rds.database_url
  sensitive   = true
}

#####################
# Elastic Beanstalk Outputs
#####################

output "eb_environment_url" {
  description = "URL of the sandbox EB environment (used by Amplify to point the frontend at the sandbox backend)"
  value       = module.elasticbeanstalk.environment_endpoint_url
}

output "eb_cname" {
  description = "Raw CNAME of the sandbox EB environment"
  value       = module.elasticbeanstalk.environment_cname
}

#####################
# Frontend Outputs
#####################

output "frontend_url" {
  description = "URL of the sandbox Amplify frontend"
  value       = module.frontend.frontend_url
}
