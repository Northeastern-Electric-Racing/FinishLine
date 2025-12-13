# Amplify Frontend Module Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., production, staging)"
  type        = string
}

variable "github_repository" {
  description = "GitHub repository URL (e.g., https://github.com/username/repo)"
  type        = string
}

variable "github_access_token" {
  description = "GitHub personal access token for repository access"
  type        = string
  sensitive   = true
}

variable "main_branch_name" {
  description = "Name of the main branch to deploy"
  type        = string
  default     = "multitenancy"
}

variable "backend_api_url" {
  description = "Backend API URL (Elastic Beanstalk URL)"
  type        = string
}

variable "additional_environment_variables" {
  description = "Additional environment variables to pass to the build"
  type        = map(string)
  default     = {}
}

variable "enable_auto_branch_creation" {
  description = "Automatically create branches in Amplify when new branches are pushed"
  type        = bool
  default     = false
}

variable "auto_branch_creation_patterns" {
  description = "Patterns for automatic branch creation (e.g., ['*', 'feature/*'])"
  type        = list(string)
  default     = ["*"]
}

variable "enable_pull_request_preview" {
  description = "Enable automatic preview deployments for pull requests"
  type        = bool
  default     = true
}

variable "enable_performance_mode" {
  description = "Enable performance mode for production branch"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Custom domain name for Amplify app (optional)"
  type        = string
  default     = ""
}

variable "domain_prefix" {
  description = "Subdomain prefix (e.g., 'www' or '' for root)"
  type        = string
  default     = ""
}

variable "create_webhook" {
  description = "Create a webhook for the main branch (usually not needed, Amplify auto-creates)"
  type        = bool
  default     = false
}
