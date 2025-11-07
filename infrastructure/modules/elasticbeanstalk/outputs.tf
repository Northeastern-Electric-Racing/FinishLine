# Elastic Beanstalk Module Outputs

output "application_name" {
  description = "Name of the Elastic Beanstalk application"
  value       = aws_elastic_beanstalk_application.main.name
}

output "environment_name" {
  description = "Name of the Elastic Beanstalk environment"
  value       = aws_elastic_beanstalk_environment.main.name
}

output "environment_id" {
  description = "ID of the Elastic Beanstalk environment"
  value       = aws_elastic_beanstalk_environment.main.id
}

output "environment_cname" {
  description = "CNAME of the Elastic Beanstalk environment"
  value       = aws_elastic_beanstalk_environment.main.cname
}

output "environment_endpoint_url" {
  description = "URL endpoint of the environment"
  value       = "http://${aws_elastic_beanstalk_environment.main.cname}"
}

output "load_balancers" {
  description = "List of load balancers attached to the environment"
  value       = aws_elastic_beanstalk_environment.main.load_balancers
}

output "autoscaling_groups" {
  description = "List of autoscaling groups attached to the environment"
  value       = aws_elastic_beanstalk_environment.main.autoscaling_groups
}
