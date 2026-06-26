# Amplify Frontend Module Outputs

output "amplify_app_id" {
  description = "The unique ID of the Amplify app"
  value       = aws_amplify_app.frontend.id
}

output "amplify_app_arn" {
  description = "ARN of the Amplify app"
  value       = aws_amplify_app.frontend.arn
}

output "default_domain" {
  description = "Default domain for the Amplify app"
  value       = aws_amplify_app.frontend.default_domain
}

output "main_branch_url" {
  description = "URL of the main branch deployment"
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.frontend.default_domain}"
}

output "frontend_url" {
  description = "Public URL for the frontend (custom domain if configured, otherwise default)"
  value       = var.domain_name != "" ? "https://${var.domain_prefix != "" ? "${var.domain_prefix}." : ""}${var.domain_name}" : "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.frontend.default_domain}"
}

output "amplify_console_url" {
  description = "URL to the Amplify Console for this app"
  value       = "https://console.aws.amazon.com/amplify/home?region=${data.aws_region.current.name}#/${aws_amplify_app.frontend.id}"
}

output "webhook_url" {
  description = "Webhook URL for triggering builds (if created)"
  value       = var.create_webhook ? aws_amplify_webhook.main[0].url : null
  sensitive   = true
}

output "certificate_verification_dns_record" {
  description = "DNS record string Amplify needs added to Route53 for certificate verification"
  value       = var.domain_name != "" ? aws_amplify_domain_association.main[0].certificate_verification_dns_record : null
}

output "subdomain_dns_record" {
  description = "DNS record string Amplify needs added to Route53 to route the custom domain"
  value       = var.domain_name != "" ? aws_amplify_domain_association.main[0].sub_domain[0].dns_record : null
}

# Data source to get current region
data "aws_region" "current" {}
