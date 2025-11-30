# Production Environment Outputs

#####################
# Network Outputs
#####################

output "vpc_id" {
  description = "VPC ID"
  value       = module.network.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.network.private_subnet_ids
}

#####################
# RDS Outputs
#####################

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_instance_endpoint
}

output "rds_address" {
  description = "RDS hostname"
  value       = module.rds.db_instance_address
}

output "database_url" {
  description = "Complete database URL"
  value       = module.rds.database_url
  sensitive   = true
}

#####################
# ECR Outputs
#####################

output "ecr_repository_url" {
  description = "ECR repository URL for Docker images"
  value       = module.ecr.repository_url
}

output "ecr_repository_name" {
  description = "ECR repository name"
  value       = module.ecr.repository_name
}

#####################
# Elastic Beanstalk Outputs
#####################

output "eb_application_name" {
  description = "Elastic Beanstalk application name"
  value       = module.elasticbeanstalk.application_name
}

output "eb_environment_name" {
  description = "Elastic Beanstalk environment name"
  value       = module.elasticbeanstalk.environment_name
}

output "eb_environment_url" {
  description = "URL of the Elastic Beanstalk environment"
  value       = module.elasticbeanstalk.environment_endpoint_url
}

output "eb_cname" {
  description = "CNAME of the Elastic Beanstalk environment"
  value       = module.elasticbeanstalk.environment_cname
}

#####################
# Frontend Outputs (Amplify)
#####################

output "amplify_app_id" {
  description = "Amplify app ID"
  value       = module.frontend.amplify_app_id
}

output "frontend_url" {
  description = "Public URL for the frontend"
  value       = module.frontend.frontend_url
}

output "amplify_console_url" {
  description = "URL to Amplify Console for monitoring builds"
  value       = module.frontend.amplify_console_url
}

output "backend_api_url" {
  description = "Backend API URL (used by frontend)"
  value       = module.elasticbeanstalk.environment_endpoint_url
}

output "amplify_default_domain" {
  description = "Amplify default domain (used for CORS)"
  value       = module.frontend.default_domain
}

#####################
# Monitoring Outputs
#####################

output "cloudwatch_dashboard_name" {
  description = "CloudWatch dashboard name"
  value       = module.monitoring.dashboard_name
}

output "sns_topic_arn" {
  description = "SNS topic ARN for alerts"
  value       = aws_sns_topic.alerts.arn
}

#####################
# Summary Output
#####################

output "deployment_summary" {
  description = "Summary of deployed resources"
  value = {
    backend_url  = module.elasticbeanstalk.environment_endpoint_url
    frontend_url = module.frontend.frontend_url
    database     = module.rds.db_instance_address
    dashboard    = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${module.monitoring.dashboard_name}"
  }
}
