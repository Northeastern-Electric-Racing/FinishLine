# Bootstrap Infrastructure
# This Terraform configuration creates the foundational resources needed
# for managing Terraform state remotely.
#
# This is a ONE-TIME SETUP
# Run this BEFORE setting up any other Terraform infrastructure
#
# Resources created:
# 1. S3 bucket for Terraform state storage
# 2. DynamoDB table for state locking
# 3. S3 bucket for Elastic Beanstalk application versions

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Bootstrap uses local state
  # After running this bootstrap, all other Terraform configs will use the S3 backend
  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "finishline"
      ManagedBy   = "Terraform"
      Purpose     = "Bootstrap"
    }
  }
}

#############
# S3 Bucket for Terraform State
#############
resource "aws_s3_bucket" "terraform_state" {
  bucket = var.state_bucket_name

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "Terraform State Storage"
    Description = "Stores Terraform state files for all environments"
  }
}

# Versioning for state file history and recovery
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption for state files
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block all public access to state bucket
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Delete old versions of state files after 90 days
resource "aws_s3_bucket_lifecycle_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    id     = "expire-old-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

#############
# DynamoDB Table for State Locking
#############
resource "aws_dynamodb_table" "terraform_locks" {
  name         = var.locks_table_name
  billing_mode = "PAY_PER_REQUEST"  # On-demand pricing, no minimum cost
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "Terraform State Locks"
    Description = "Manages locking for Terraform state to prevent concurrent modifications"
  }
}

#############
# S3 Bucket for Elastic Beanstalk Application Versions
#############
resource "aws_s3_bucket" "eb_versions" {
  bucket = var.eb_versions_bucket_name

  tags = {
    Name        = "Elastic Beanstalk Versions"
    Description = "Stores Elastic Beanstalk application version bundles"
  }
}

# Enable versioning for EB application versions
resource "aws_s3_bucket_versioning" "eb_versions" {
  bucket = aws_s3_bucket.eb_versions.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Block public access to EB versions bucket
resource "aws_s3_bucket_public_access_block" "eb_versions" {
  bucket = aws_s3_bucket.eb_versions.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Clean up old EB versions after 90 days
resource "aws_s3_bucket_lifecycle_configuration" "eb_versions" {
  bucket = aws_s3_bucket.eb_versions.id

  rule {
    id     = "cleanup-old-versions"
    status = "Enabled"

    filter {}

    expiration {
      days = 90
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

#############
# GitHub Actions OIDC Provider
# Allows GitHub Actions workflows to assume AWS roles without long-lived credentials.
# This is a global IAM resource — only one per account regardless of region.
#############
resource "aws_iam_openid_connect_provider" "github_actions" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  # Stable thumbprint for token.actions.githubusercontent.com
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]

  tags = {
    Name    = "github-actions-oidc"
    Purpose = "Allows GitHub Actions to assume AWS roles via OIDC"
  }
}

#############
# CI/CD Role — assumed by GitHub Actions to spin up/tear down the sandbox
#############
resource "aws_iam_role" "cicd" {
  name = "finishline-cicd"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github_actions.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:*"
          }
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })

  tags = {
    Name    = "finishline-cicd"
    Purpose = "GitHub Actions sandbox spin-up and tear-down"
  }
}

# Terraform state access (scoped to sandbox key only)
resource "aws_iam_role_policy" "cicd_terraform_state" {
  name = "terraform-state-access"
  role = aws_iam_role.cicd.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "StateReadWrite"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${var.state_bucket_name}",
          "arn:aws:s3:::${var.state_bucket_name}/sandbox/*"
        ]
      },
      {
        Sid    = "StateLocking"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem"
        ]
        Resource = "arn:aws:dynamodb:${var.aws_region}:*:table/${var.locks_table_name}"
      }
    ]
  })
}

# Network — VPC, subnets, IGW, route tables, security groups (all tagged sandbox)
resource "aws_iam_role_policy" "cicd_network" {
  name = "sandbox-network"
  role = aws_iam_role.cicd.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EC2NetworkFull"
        Effect = "Allow"
        Action = [
          "ec2:CreateVpc",
          "ec2:DeleteVpc",
          "ec2:ModifyVpcAttribute",
          "ec2:DescribeVpcs",
          "ec2:CreateSubnet",
          "ec2:DeleteSubnet",
          "ec2:ModifySubnetAttribute",
          "ec2:DescribeSubnets",
          "ec2:CreateInternetGateway",
          "ec2:DeleteInternetGateway",
          "ec2:AttachInternetGateway",
          "ec2:DetachInternetGateway",
          "ec2:DescribeInternetGateways",
          "ec2:CreateRouteTable",
          "ec2:DeleteRouteTable",
          "ec2:CreateRoute",
          "ec2:DeleteRoute",
          "ec2:AssociateRouteTable",
          "ec2:DisassociateRouteTable",
          "ec2:DescribeRouteTables",
          "ec2:CreateSecurityGroup",
          "ec2:DeleteSecurityGroup",
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:AuthorizeSecurityGroupEgress",
          "ec2:RevokeSecurityGroupIngress",
          "ec2:RevokeSecurityGroupEgress",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeSecurityGroupRules",
          "ec2:CreateTags",
          "ec2:DescribeAvailabilityZones",
          "ec2:DescribeAccountAttributes"
        ]
        Resource = "*"
      }
    ]
  })
}

# RDS — create/delete instances and snapshots (scoped to sandbox identifier prefix)
resource "aws_iam_role_policy" "cicd_rds" {
  name = "sandbox-rds"
  role = aws_iam_role.cicd.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SandboxRDSManage"
        Effect = "Allow"
        Action = [
          "rds:CreateDBInstance",
          "rds:DeleteDBInstance",
          "rds:ModifyDBInstance",
          "rds:DescribeDBInstances",
          "rds:CreateDBSubnetGroup",
          "rds:DeleteDBSubnetGroup",
          "rds:DescribeDBSubnetGroups",
          "rds:AddTagsToResource",
          "rds:ListTagsForResource",
          "rds:DescribeDBParameterGroups"
        ]
        Resource = "*"
        Condition = {
          StringLike = {
            "rds:db-tag/Environment" = "sandbox"
          }
        }
      },
      {
        # DescribeDBInstances and subnet group ops don't support tag conditions
        Sid    = "RDSDescribeGlobal"
        Effect = "Allow"
        Action = [
          "rds:DescribeDBInstances",
          "rds:DescribeDBSubnetGroups",
          "rds:DescribeDBSnapshots",
          "rds:DescribeDBEngineVersions"
        ]
        Resource = "*"
      },
      {
        Sid    = "ProdSnapshotRead"
        Effect = "Allow"
        Action = [
          "rds:CreateDBSnapshot",
          "rds:DescribeDBSnapshots",
          "rds:RestoreDBInstanceFromDBSnapshot",
          "rds:CopyDBSnapshot"
        ]
        Resource = "*"
      }
    ]
  })
}

# Elastic Beanstalk — full access scoped to finishline-sandbox resources
resource "aws_iam_role_policy" "cicd_elasticbeanstalk" {
  name = "sandbox-elasticbeanstalk"
  role = aws_iam_role.cicd.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EBManage"
        Effect = "Allow"
        Action = [
          "elasticbeanstalk:CreateApplication",
          "elasticbeanstalk:DeleteApplication",
          "elasticbeanstalk:DescribeApplications",
          "elasticbeanstalk:CreateEnvironment",
          "elasticbeanstalk:DeleteEnvironment",
          "elasticbeanstalk:DescribeEnvironments",
          "elasticbeanstalk:DescribeEnvironmentResources",
          "elasticbeanstalk:UpdateEnvironment",
          "elasticbeanstalk:TerminateEnvironment",
          "elasticbeanstalk:CreateApplicationVersion",
          "elasticbeanstalk:DeleteApplicationVersion",
          "elasticbeanstalk:DescribeApplicationVersions",
          "elasticbeanstalk:DescribeConfigurationSettings",
          "elasticbeanstalk:DescribeConfigurationOptions",
          "elasticbeanstalk:ValidateConfigurationSettings",
          "elasticbeanstalk:ListTagsForResource",
          "elasticbeanstalk:AddTags",
          "elasticbeanstalk:DescribeEvents"
        ]
        Resource = "*"
      },
      {
        # EB needs to manage ELB/ASG/EC2 resources on your behalf
        Sid    = "EBSupportingServices"
        Effect = "Allow"
        Action = [
          "autoscaling:*",
          "elasticloadbalancing:*",
          "cloudwatch:PutMetricAlarm",
          "cloudwatch:DeleteAlarms",
          "cloudwatch:DescribeAlarms",
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM — create/delete the sandbox EB roles (name-scoped to finishline-sandbox-*)
resource "aws_iam_role_policy" "cicd_iam" {
  name = "sandbox-iam"
  role = aws_iam_role.cicd.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SandboxRolesManage"
        Effect = "Allow"
        Action = [
          "iam:CreateRole",
          "iam:DeleteRole",
          "iam:GetRole",
          "iam:PutRolePolicy",
          "iam:DeleteRolePolicy",
          "iam:GetRolePolicy",
          "iam:AttachRolePolicy",
          "iam:DetachRolePolicy",
          "iam:ListAttachedRolePolicies",
          "iam:ListRolePolicies",
          "iam:CreateInstanceProfile",
          "iam:DeleteInstanceProfile",
          "iam:GetInstanceProfile",
          "iam:AddRoleToInstanceProfile",
          "iam:RemoveRoleFromInstanceProfile",
          "iam:TagRole",
          "iam:UntagRole",
          "iam:ListInstanceProfilesForRole"
        ]
        Resource = [
          "arn:aws:iam::*:role/finishline-sandbox-*",
          "arn:aws:iam::*:instance-profile/finishline-sandbox-*"
        ]
      },
      {
        Sid      = "PassRoleToEB"
        Effect   = "Allow"
        Action   = "iam:PassRole"
        Resource = "arn:aws:iam::*:role/finishline-sandbox-*"
      }
    ]
  })
}

# CloudWatch — log groups for sandbox
resource "aws_iam_role_policy" "cicd_cloudwatch" {
  name = "sandbox-cloudwatch"
  role = aws_iam_role.cicd.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "LogGroupManage"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:DeleteLogGroup",
          "logs:DescribeLogGroups",
          "logs:PutRetentionPolicy",
          "logs:ListTagsLogGroup",
          "logs:TagLogGroup",
          "logs:UntagLogGroup",
          "logs:ListTagsForResource",
          "logs:TagResource",
          "logs:UntagResource"
        ]
        Resource = "arn:aws:logs:*:*:log-group:/aws/elasticbeanstalk/finishline-sandbox*"
      }
    ]
  })
}

# Secrets Manager — read prod secrets, write sandbox DATABASE_URL
resource "aws_iam_role_policy" "cicd_secrets" {
  name = "sandbox-secrets"
  role = aws_iam_role.cicd.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ReadProdSecrets"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:*:*:secret:finishline/production/*"
      }
    ]
  })
}
