# IAM Module - Roles and Policies

#############
# Elastic Beanstalk Service Role
#############
resource "aws_iam_role" "eb_service_role" {
  name = "${var.project_name}-${var.environment}-eb-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "elasticbeanstalk.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-eb-service-role"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_iam_role_policy_attachment" "eb_service_role_policy" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkService"
}

resource "aws_iam_role_policy_attachment" "eb_enhanced_health" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

#############
# EC2 Instance Profile for Elastic Beanstalk
#############
resource "aws_iam_role" "eb_ec2_role" {
  name = "${var.project_name}-${var.environment}-eb-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-eb-ec2-role"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Attach AWS managed policies
resource "aws_iam_role_policy_attachment" "eb_web_tier" {
  role       = aws_iam_role.eb_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy_attachment" "eb_worker_tier" {
  role       = aws_iam_role.eb_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier"
}

resource "aws_iam_role_policy_attachment" "eb_multicontainer_docker" {
  role       = aws_iam_role.eb_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker"
}

# Custom policy for SSM Parameter Store and Secrets Manager access
resource "aws_iam_role_policy" "eb_secrets_access" {
  name = "${var.project_name}-${var.environment}-eb-secrets-access"
  role = aws_iam_role.eb_ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowSSMParameterAccess"
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = "arn:aws:ssm:${var.aws_region}:*:parameter/${var.project_name}/${var.environment}/*"
      },
      {
        Sid    = "AllowSecretsManagerAccess"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:*:secret:${var.project_name}/${var.environment}/*"
      },
      {
        Sid    = "AllowKMSDecrypt"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })
}

# Custom policy for CloudWatch Logs
resource "aws_iam_role_policy" "eb_cloudwatch_logs" {
  name = "${var.project_name}-${var.environment}-eb-cloudwatch"
  role = aws_iam_role.eb_ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:*:log-group:/aws/elasticbeanstalk/${var.project_name}-${var.environment}/*"
      }
    ]
  })
}

# EC2 Instance Profile
resource "aws_iam_instance_profile" "eb_ec2_profile" {
  name = "${var.project_name}-${var.environment}-eb-ec2-profile"
  role = aws_iam_role.eb_ec2_role.name

  tags = {
    Name        = "${var.project_name}-${var.environment}-eb-ec2-profile"
    Environment = var.environment
    Project     = var.project_name
  }
}

#############
# CloudFront OAI for S3 Access (Frontend)
#############
resource "aws_cloudfront_origin_access_identity" "frontend" {
  count   = var.create_cloudfront_oai ? 1 : 0
  comment = "${var.project_name}-${var.environment} CloudFront OAI for frontend"
}
