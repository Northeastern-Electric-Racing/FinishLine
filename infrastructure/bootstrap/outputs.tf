# Bootstrap Outputs

output "state_bucket_name" {
  description = "Name of the S3 bucket for Terraform state"
  value       = aws_s3_bucket.terraform_state.id
}

output "state_bucket_arn" {
  description = "ARN of the S3 bucket for Terraform state"
  value       = aws_s3_bucket.terraform_state.arn
}

output "locks_table_name" {
  description = "Name of the DynamoDB table for state locking"
  value       = aws_dynamodb_table.terraform_locks.id
}

output "locks_table_arn" {
  description = "ARN of the DynamoDB table for state locking"
  value       = aws_dynamodb_table.terraform_locks.arn
}

output "eb_versions_bucket_name" {
  description = "Name of the S3 bucket for EB application versions"
  value       = aws_s3_bucket.eb_versions.id
}

output "eb_versions_bucket_arn" {
  description = "ARN of the S3 bucket for EB application versions"
  value       = aws_s3_bucket.eb_versions.arn
}

output "next_steps" {
  description = "Instructions for next steps"
  value       = <<-EOT
    Bootstrap Complete!
    
    The following resources have been created:
    - S3 Bucket for Terraform State: ${aws_s3_bucket.terraform_state.id}
    - DynamoDB Table for State Locking: ${aws_dynamodb_table.terraform_locks.id}
    - S3 Bucket for EB Versions: ${aws_s3_bucket.eb_versions.id}
    
    Next Steps:
    1. The backend configuration in ../backend.tf is already configured to use these resources
    2. Navigate to your environment directory: cd ../environments/production
    3. Initialize Terraform: terraform init
    4. Review the plan: terraform plan
    5. Apply the infrastructure: terraform apply
    
    Note: Keep this bootstrap state file safe! It's stored locally in this directory.
  EOT
}
