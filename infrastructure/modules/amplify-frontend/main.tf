# Amplify Frontend Module - Modern CI/CD Frontend Hosting

#############
# Amplify App
#############
resource "aws_amplify_app" "frontend" {
  name       = "${var.project_name}-${var.environment}-frontend"
  repository = var.github_repository

  # GitHub access token for repository access
  access_token = var.github_access_token

  # Build specification
  build_spec = yamlencode({
    version = 1
    frontend = {
      phases = {
        preBuild = {
          commands = [
            "echo 'Installing dependencies...'",
            "yarn install",
            "echo 'Building shared package...'",
            "yarn workspace shared build",
          ]
        }
        build = {
          commands = [
            "echo 'Building frontend...'",
            "yarn workspace frontend build",
          ]
        }
      }
      artifacts = {
        baseDirectory = "src/frontend/build"
        files         = ["**/*"]
      }
      cache = {
        paths = [
          "node_modules/**/*",
          "src/frontend/node_modules/**/*",
          "src/backend/node_modules/**/*",
          "src/shared/node_modules/**/*",
        ]
      }
    }
  })

  # Environment variables for the build
  environment_variables = merge(
    {
      # Build configuration
      NODE_OPTIONS = "--max-old-space-size=4096"
      
      # Backend API URL - will be injected into React build
      REACT_APP_API_URL = var.backend_api_url
    },
    var.additional_environment_variables
  )

  # Custom rules for SPA routing
  custom_rule {
    source = "/<*>"
    status = "404"
    target = "/index.html"
  }

  custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>"
    status = "200"
    target = "/index.html"
  }

  # Enable auto branch creation (optional)
  enable_auto_branch_creation = var.enable_auto_branch_creation
  
  # Auto branch creation patterns (e.g., all branches)
  auto_branch_creation_patterns = var.auto_branch_creation_patterns

  # Auto branch creation configuration
  auto_branch_creation_config {
    enable_auto_build = true
    framework         = "React"
    stage             = "DEVELOPMENT"
    
    environment_variables = {
      NODE_OPTIONS      = "--max-old-space-size=4096"
      REACT_APP_API_URL = var.backend_api_url
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-frontend"
    Environment = var.environment
    Project     = var.project_name
  }
}

#############
# Main Branch Configuration
#############
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = var.main_branch_name

  # Enable automatic builds on push
  enable_auto_build = true

  # Production stage
  stage = "PRODUCTION"

  # Framework detection
  framework = "React"

  # Environment variables specific to main branch (can override app-level)
  environment_variables = {
    REACT_APP_API_URL = var.backend_api_url
  }

  # Enable performance mode for production
  enable_performance_mode = var.enable_performance_mode

  tags = {
    Name        = "${var.project_name}-${var.environment}-main-branch"
    Environment = var.environment
    Branch      = var.main_branch_name
  }
}

#############
# Domain Association (Optional)
#############
resource "aws_amplify_domain_association" "main" {
  count = var.domain_name != "" ? 1 : 0

  app_id      = aws_amplify_app.frontend.id
  domain_name = var.domain_name

  # Wait for DNS propagation
  wait_for_verification = true

  # Main branch subdomain configuration
  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = var.domain_prefix # e.g., "" for root domain or "www"
  }

  # Add subdomain for PR previews if enabled
  # dynamic "sub_domain" {
  #   for_each = var.enable_pull_request_preview ? [1] : []
  #   content {
  #     branch_name = "*"
  #     prefix      = "pr-*"
  #   }
  # }
}

#############
# Pull Request Preview Configuration
#############
# resource "aws_amplify_branch" "pr_preview" {
#   count = var.enable_pull_request_preview ? 1 : 0

#   app_id      = aws_amplify_app.frontend.id
#   branch_name = "*"

#   enable_auto_build           = true
#   enable_pull_request_preview = true
#   stage                      = "DEVELOPMENT"

#   # PR preview environment variables
#   environment_variables = {
#     REACT_APP_API_URL = var.backend_api_url # You might want a staging backend URL here
#   }

#   tags = {
#     Name        = "${var.project_name}-${var.environment}-pr-preview"
#     Environment = var.environment
#   }
# }

#############
# Webhook for GitHub Integration (Optional - Amplify creates this automatically)
#############
resource "aws_amplify_webhook" "main" {
  count = var.create_webhook ? 1 : 0

  app_id      = aws_amplify_app.frontend.id
  branch_name = aws_amplify_branch.main.branch_name
  description = "Webhook for ${var.main_branch_name} branch"
}
