# IAM Module Outputs

output "eb_service_role_name" {
  description = "Name of the Elastic Beanstalk service role"
  value       = aws_iam_role.eb_service_role.name
}

output "eb_service_role_arn" {
  description = "ARN of the Elastic Beanstalk service role"
  value       = aws_iam_role.eb_service_role.arn
}

output "eb_ec2_instance_profile_name" {
  description = "Name of the EC2 instance profile for Elastic Beanstalk"
  value       = aws_iam_instance_profile.eb_ec2_profile.name
}

output "eb_ec2_role_name" {
  description = "Name of the EC2 role for Elastic Beanstalk"
  value       = aws_iam_role.eb_ec2_role.name
}

output "cloudfront_oai_iam_arn" {
  description = "IAM ARN of the CloudFront Origin Access Identity"
  value       = var.create_cloudfront_oai ? aws_cloudfront_origin_access_identity.frontend[0].iam_arn : null
}

output "cloudfront_oai_path" {
  description = "Path of the CloudFront Origin Access Identity"
  value       = var.create_cloudfront_oai ? aws_cloudfront_origin_access_identity.frontend[0].cloudfront_access_identity_path : null
}
