# DNS Module Outputs

output "hosted_zone_id" {
  description = "Route53 hosted zone ID"
  value       = data.aws_route53_zone.main.zone_id
}

output "frontend_certificate_arn" {
  description = "ARN of ACM certificate for frontend"
  value       = aws_acm_certificate.frontend.arn
}

output "backend_certificate_arn" {
  description = "ARN of ACM certificate for backend"
  value       = aws_acm_certificate.backend.arn
}

output "frontend_domain" {
  description = "Frontend domain name"
  value       = var.frontend_domain
}

output "backend_domain" {
  description = "Backend domain name"
  value       = var.backend_domain
}

output "backend_url" {
  description = "Full backend URL with HTTPS"
  value       = "https://${var.backend_domain}"
}
