# Terraform Backend Configuration
# This file configures where Terraform stores its state
# State is stored in S3 with locking via DynamoDB

# NOTE: Before running terraform init, you need to:
# 1. Create an S3 bucket for state storage
# 2. Create a DynamoDB table for state locking
# 
# Run this AWS CLI command to create them:
# 
# aws s3api create-bucket --bucket finishline-terraform-state --region us-east-1
# 
# aws dynamodb create-table \
#   --table-name finishline-terraform-locks \
#   --attribute-definitions AttributeName=LockID,AttributeType=S \
#   --key-schema AttributeName=LockID,KeyType=HASH \
#   --billing-mode PAY_PER_REQUEST \
#   --region us-east-1

terraform {
  backend "s3" {
    bucket         = "finishline-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "finishline-terraform-locks"
  }

  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
