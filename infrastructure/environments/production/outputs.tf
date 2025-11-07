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
# Frontend Outputs
#####################

output "frontend_s3_bucket" {
  description = "S3 bucket name for frontend"
  value       = module.frontend.s3_bucket_name
}

output "frontend_url" {
  description = "Public URL for the frontend"
  value       = module.frontend.frontend_url
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = module.frontend.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = module.frontend.cloudfront_domain_name
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
  value       = module.monitoring.sns_topic_arn
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
