# DNS Module - Route53 Configuration for Custom Domains

# Data source to get the existing hosted zone
data "aws_route53_zone" "main" {
  name         = var.hosted_zone_name
  private_zone = false
}

#############
# ACM Certificate for Frontend (Amplify)
#############
resource "aws_acm_certificate" "frontend" {
  domain_name       = var.frontend_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-frontend-cert"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Amplify Frontend"
  }
}

# DNS validation records for frontend certificate
resource "aws_route53_record" "frontend_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.frontend.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Wait for certificate validation to complete
resource "aws_acm_certificate_validation" "frontend" {
  certificate_arn         = aws_acm_certificate.frontend.arn
  validation_record_fqdns = [for record in aws_route53_record.frontend_cert_validation : record.fqdn]
}

#############
# ACM Certificate for Backend (Elastic Beanstalk)
#############
resource "aws_acm_certificate" "backend" {
  domain_name       = var.backend_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-backend-cert"
    Environment = var.environment
    Project     = var.project_name
    Purpose     = "Elastic Beanstalk Backend"
  }
}

# DNS validation records for backend certificate
resource "aws_route53_record" "backend_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.backend.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Wait for certificate validation to complete
resource "aws_acm_certificate_validation" "backend" {
  certificate_arn         = aws_acm_certificate.backend.arn
  validation_record_fqdns = [for record in aws_route53_record.backend_cert_validation : record.fqdn]
}

#############
# Route53 Record - Backend (Points to Elastic Beanstalk)
#############
resource "aws_route53_record" "backend" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.backend_domain
  type    = "CNAME"
  ttl     = 300
  records = [var.backend_cname]
}

#############
# Route53 Record - Frontend (Managed by Amplify)
#############
# Note: Amplify automatically manages DNS records when you configure
# a custom domain. We don't create Route53 records manually for Amplify.
# Instead, Amplify will provide you with DNS records to verify domain ownership.
