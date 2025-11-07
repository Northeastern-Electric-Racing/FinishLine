# Frontend Module Outputs

output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.frontend.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.frontend.arn
}

output "s3_bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.frontend.bucket_domain_name
}

output "s3_website_endpoint" {
  description = "Website endpoint of the S3 bucket (if website hosting enabled)"
  value       = var.use_cloudfront ? null : aws_s3_bucket_website_configuration.frontend[0].website_endpoint
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = var.use_cloudfront ? aws_cloudfront_distribution.frontend[0].id : null
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = var.use_cloudfront ? aws_cloudfront_distribution.frontend[0].domain_name : null
}

output "frontend_url" {
  description = "Public URL for the frontend"
  value       = var.use_cloudfront ? "https://${aws_cloudfront_distribution.frontend[0].domain_name}" : "http://${aws_s3_bucket_website_configuration.frontend[0].website_endpoint}"
}
