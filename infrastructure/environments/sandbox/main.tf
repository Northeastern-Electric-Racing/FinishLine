# Sandbox Environment - Main Configuration
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "finishline-terraform-state"
    key            = "sandbox/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "finishline-terraform-locks"
  }
}

provider "aws" {
  region = "us-east-2"

  default_tags {
    tags = {
      Project     = "finishline"
      Environment = "sandbox"
      ManagedBy   = "Terraform"
    }
  }
}

#############
# Network Module
#############
module "network" {
  source = "../../modules/network"

  project_name = "finishline"
  environment  = "sandbox"
  aws_region   = "us-east-2"
  vpc_cidr     = "10.1.0.0/16"
}

#############
# IAM Module
#############
module "iam" {
  source = "../../modules/iam"

  project_name          = "finishline"
  environment           = "sandbox"
  aws_region            = "us-east-2"
  create_cloudfront_oai = false
}

#############
# RDS Module
#############
module "rds" {
  source = "../../modules/rds"

  project_name = "finishline"
  environment  = "sandbox"

  # Network
  db_subnet_group_name = module.network.db_subnet_group_name
  security_group_id    = module.network.rds_security_group_id

  # Instance config - downsized for sandbox
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  # Sandbox-specific: no backups, no deletion protection
  backup_retention_period = 0
  deletion_protection     = false
  alarm_actions           = []

  # Credentials
  database_name   = "finishline"
  master_username = "finishline"
  master_password = "changeme123!"
}