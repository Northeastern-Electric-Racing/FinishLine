# Bootstrap Infrastructure
#
# NOTE: The github-actions-finishline IAM user was created manually outside of Terraform.
# The policy below attaches to that existing user by name.
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

#############
# IAM Policy for Sandbox Workflow Operations
<<<<<<< Updated upstream
# The github-actions-finishline user needs these permissions for sandbox-up.yml:
# - RDS snapshot operations (create from prod, copy cross-region)
# - Secrets Manager reads (pull prod secrets)
# - EB describe (pull prod non-secret config)
=======
# Attaches to the manually-created github-actions-finishline user.
# Grants permissions needed by sandbox-up.yml that the user doesn't already have.
>>>>>>> Stashed changes
#############
resource "aws_iam_user_policy" "github_actions_sandbox" {
  name = "sandbox-workflow-permissions"
  user = "github-actions-finishline"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
<<<<<<< Updated upstream
=======
        Sid    = "TerraformStateS3"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::finishline-terraform-state",
          "arn:aws:s3:::finishline-terraform-state/*"
        ]
      },
      {
        Sid    = "TerraformStateDynamoDB"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem"
        ]
        Resource = "arn:aws:dynamodb:us-east-1:830877454256:table/finishline-terraform-locks"
      },
      {
>>>>>>> Stashed changes
        Sid    = "RDSSnapshotOperations"
        Effect = "Allow"
        Action = [
          "rds:CreateDBSnapshot",
          "rds:DescribeDBSnapshots",
          "rds:CopyDBSnapshot",
          "rds:DeleteDBSnapshot",
          "rds:ListTagsForResource",
          "rds:AddTagsToResource"
        ]
        Resource = "*"
      },
      {
<<<<<<< Updated upstream
        Sid    = "SecretsManagerReadProd"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:us-east-1:830877454256:secret:finishline/production/*"
      },
      {
=======
>>>>>>> Stashed changes
        Sid    = "KMSForSnapshotCopy"
        Effect = "Allow"
        Action = [
          "kms:CreateGrant",
          "kms:DescribeKey",
          "kms:GenerateDataKey",
          "kms:Decrypt",
          "kms:ReEncryptFrom",
          "kms:ReEncryptTo"
        ]
        Resource = "*"
        Condition = {
          StringLike = {
            "kms:ViaService" = [
              "rds.us-east-1.amazonaws.com",
              "rds.us-east-2.amazonaws.com"
            ]
          }
        }
      },
      {
<<<<<<< Updated upstream
=======
        Sid    = "SecretsManagerReadProd"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:us-east-1:830877454256:secret:finishline/production/*"
      },
      {
>>>>>>> Stashed changes
        Sid    = "ElasticBeanstalkDescribeProd"
        Effect = "Allow"
        Action = [
          "elasticbeanstalk:DescribeConfigurationSettings",
          "elasticbeanstalk:DescribeEnvironments"
        ]
        Resource = "*"
      }
    ]
  })
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

