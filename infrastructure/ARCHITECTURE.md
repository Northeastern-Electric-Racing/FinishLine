# FinishLine Infrastructure Architecture

## Overview

FinishLine's infrastructure is deployed on AWS using Terraform for infrastructure-as-code management. The architecture follows cloud best practices with proper separation of concerns, security isolation, and comprehensive monitoring.

### Architecture Diagram

```
                 ┌─────────────────────────────────────────┐
                 │          Internet                       │
                 └──────────────┬──────────────────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
                 │ HTTPS                       │ HTTPS
                 ▼                             │
    ┌───────────────────────┐                  │
    │   AWS Amplify         │                  │
    │   (Frontend CDN)      │                  │
    │   CloudFront + S3     │                  │
    └───────────────────────┘                  │
                                               │
    ┌──────────────────────────────────────────┼───────────────────────────┐
    │  VPC (10.0.0.0/16)                       │                           │
    │                                          │                           │
    │  ┌───────────────────────────────────────┼─────────────────────────┐ │
    │  │  Public Subnets (us-east-1a, 1b)      │                         │ │
    │  │                                       │                         │ │
    │  │              ┌────────────────────────▼───────────────┐         │ │
    │  │              │  Application Load Balancer             │         │ │
    │  │              │  (Port 80/443)                         │         │ │
    │  │              └────────────────┬───────────────────────┘         │ │
    │  │                               │                                 │ │
    │  │                               │ HTTP (3001)                     │ │
    │  │                               │                                 │ │
    │  │              ┌────────────────▼───────────────┐                 │ │
    │  │              │  Auto Scaling Group            │                 │ │
    │  │              │  ┌──────────────────────────┐  │                 │ │
    │  │              │  │ EC2 Instance             │  │                 │ │
    │  │              │  │ t3.small (Docker)        │  │                 │ │
    │  │              │  │ Backend API              │  │                 │ │
    │  │              │  └──────────┬───────────────┘  │                 │ │
    │  │              │             │                  │                 │ │
    │  │              │  ┌──────────▼───────────────┐  │                 │ │
    │  │              │  │ EC2 Instance             │  │                 │ │
    │  │              │  │ t3.small (Docker)        │  │                 │ │
    │  │              │  │ Backend API              │  │                 │ │
    │  │              │  └──────────┬───────────────┘  │                 │ │
    │  │              └─────────────┼──────────────────┘                 │ │
    │  └────────────────────────────┼────────────────────────────────────┘ │
    │                               │                                      │
    │                               │ PostgreSQL (5432)                    │
    │                               │                                      │
    │  ┌────────────────────────────┼────────────────────────────────────┐ │
    │  │  Private Subnets (us-east-1a, 1b)                               │ │
    │  │                            │                                    │ │
    │  │              ┌─────────────▼───────────────┐                    │ │
    │  │              │  RDS PostgreSQL             │                    │ │
    │  │              │  db.t4g.medium              │                    │ │
    │  │              │  - Multi-AZ Optional        │                    │ │
    │  │              │  - Automated Backups        │                    │ │
    │  │              │  - Performance Insights     │                    │ │
    │  │              └─────────────────────────────┘                    │ │
    │  └──────────────────────────────────────────────────────────────────┘ │
    └─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────┐      ┌──────────────────────┐
    │  AWS Secrets Manager │      │  CloudWatch          │
    │  - DB Password       │      │  - Logs              │
    │  - API Keys          │      │  - Metrics           │
    │  - OAuth Secrets     │      │  - Alarms            │
    └──────────────────────┘      └──────────────────────┘
```

### Traffic Flow

1. **Frontend Request**: User browser → AWS Amplify (CloudFront CDN) → Serves static React app
2. **API Request**: User browser → Application Load Balancer (HTTPS:443) → EC2 instances in Auto Scaling Group (HTTP:3001)
3. **Database Query**: Backend application → RDS PostgreSQL in private subnet (port 5432)
4. **Monitoring**: All components → CloudWatch Logs and Metrics
5. **Secrets**: Backend instances retrieve secrets from AWS Secrets Manager at runtime

## Core Components

The diagram above shows the complete AWS architecture. Key design decisions include separating frontend and backend hosting, isolating the database in private subnets, and using an Application Load Balancer for traffic distribution and SSL termination.

### 1. Network Infrastructure (VPC)

**What it is:** A Virtual Private Cloud providing isolated network space for all infrastructure components.

**Architecture:**
- VPC with CIDR block `10.0.0.0/16`
- Two Availability Zones for high availability (us-east-1a, us-east-1b)
- Public subnets (for ALB and Elastic Beanstalk instances)
- Private subnets (for RDS database)
- Internet Gateway for external connectivity
- Security groups controlling traffic between components

**Why this design:**
- **Multi-AZ deployment** ensures the Application Load Balancer can distribute traffic across multiple availability zones, providing fault tolerance
- **Private subnets for RDS** ensure the database is not directly accessible from the internet, following security best practices
- **Public subnets for EB instances** allow them to communicate with external services (Google APIs, Slack) while the ALB handles incoming traffic
- **Security groups** provide stateful firewalls that only allow necessary traffic between components

**Security Groups:**
- **ALB Security Group:** Allows HTTP (80) and HTTPS (443) from internet
- **EB Instance Security Group:** Allows HTTP and application port (3001) only from ALB
- **RDS Security Group:** Allows PostgreSQL (5432) only from EB instances

### 2. RDS PostgreSQL Database

**What it is:** Amazon Relational Database Service running PostgreSQL, providing managed database hosting.

**Architecture:**
- PostgreSQL 16 (minor versions auto-update)
- Instance class: `db.t4g.medium` (ARM-based, cost-effective)
- 20 GB storage with automatic scaling
- Located in private subnets
- Not publicly accessible (security requirement)
- Automated daily backups with 7-day retention
- Deletion protection enabled

**Why this design:**
- **Managed service** eliminates operational overhead of database maintenance, patching, and backups
- **Private subnet placement** ensures database cannot be accessed directly from internet
- **ARM-based instances (t4g)** provide better price-performance ratio than x86 instances
- **Automated backups** protect against data loss with point-in-time recovery
- **Performance Insights** enabled for query performance monitoring and optimization
- **Multi-AZ disabled by default** to save costs (can be enabled for true high availability with automatic failover)

**Access Pattern:**
- Applications connect via SSH tunnel through Elastic Beanstalk instances (see GUIDE.md)
- Backend application connects directly via VPC networking
- No public IP address assigned

### 3. Elastic Beanstalk (Backend)

**What it is:** AWS Elastic Beanstalk provides a Platform-as-a-Service for deploying and scaling the Node.js backend application.

**Architecture:**
- Single-container Docker platform
- Auto-scaling group: 1-4 EC2 instances (t3.small)
- Application Load Balancer distributing traffic
- Rolling deployment with additional batch
- Enhanced health reporting
- CloudWatch Logs integration

**Why this design:**
- **Elastic Beanstalk abstracts infrastructure management** while maintaining control over underlying resources
- **Docker deployment** provides consistent environment between development and production
- **Auto-scaling** automatically adjusts capacity based on CPU utilization (20-70% thresholds)
- **Rolling deployment with additional batch** ensures zero-downtime deployments by launching new instances before terminating old ones
- **Health checks** continuously monitor application health, automatically replacing unhealthy instances
- **t3.small instances** provide burstable performance suitable for typical application workloads

**Deployment Process:**
1. Docker image built via GitHub Actions CI/CD
2. Image pushed to Amazon ECR (Elastic Container Registry)
3. Elastic Beanstalk pulls image and deploys to instances
4. Load balancer gradually shifts traffic to new instances
5. Old instances terminated after health checks pass

**Environment Variables:**
Elastic Beanstalk injects environment variables including:
- Database connection string (from RDS)
- Application secrets (from AWS Secrets Manager)
- Google OAuth credentials
- Slack integration tokens
- Feature flags and configuration

### 4. AWS Amplify (Frontend)

**What it is:** AWS Amplify provides modern CI/CD and hosting for the React frontend application.

**Architecture:**
- Integrated with GitHub repository
- Automatic builds on push to main branch
- Global CDN distribution
- Custom domain support (finishlinebyner.com)
- Environment variable injection at build time

**Why this design:**
- **GitHub integration** enables automatic deployments on code push, eliminating manual deployment steps
- **CDN distribution** provides fast content delivery globally with edge caching
- **Build-time environment variables** allow different configurations per environment
- **Automatic HTTPS** with managed SSL certificates
- **Atomic deployments** ensure users never see partially deployed code

**Build Process:**
1. Push to main branch triggers webhook
2. Amplify clones repository and installs dependencies
3. Builds shared package, then frontend package (monorepo support)
4. Deploys to CDN with cache invalidation
5. Updates DNS to point to new deployment

**Environment Variables Injected:**
- `VITE_REACT_APP_BACKEND_URL`: Backend API endpoint
- `VITE_REACT_APP_GOOGLE_AUTH_CLIENT_ID`: Google OAuth client ID
- `VITE_REACT_APP_CLARITY_PROJECT_ID`: Microsoft Clarity analytics

### 5. AWS Secrets Manager

**What it is:** Secure storage for sensitive configuration values and credentials.

**Secrets Stored:**
- Database master password
- Session secret for application session management
- Google OAuth client secret
- Google Drive and Calendar refresh tokens
- Slack API credentials (bot token, signing secret)
- Application encryption key
- Notification endpoint secret

**Why this design:**
- **Centralized secret management** eliminates hardcoded credentials in code or configuration files
- **Encryption at rest** using AWS KMS (Key Management Service)
- **Access control via IAM** ensures only authorized services can retrieve secrets
- **Automatic rotation support** (not currently configured but available)
- **7-day recovery window** protects against accidental deletion

**Access Pattern:**
- Terraform reads secrets from environment variables during deployment
- Terraform passes secrets to Elastic Beanstalk as environment variables
- Backend application reads secrets from environment variables at runtime

### 6. CloudWatch Monitoring & Logging

**What it is:** Centralized logging, metrics, and alerting for all infrastructure components.

**Architecture:**
- **CloudWatch Logs** for application and platform logs
- **CloudWatch Metrics** for performance monitoring
- **CloudWatch Alarms** for automated alerting
- **CloudWatch Dashboard** for real-time visualization
- **SNS Topics** for alarm notifications

**Monitored Metrics:**

**Elastic Beanstalk / EC2:**
- CPU utilization (alarm threshold: >80%)
- Memory utilization via CloudWatch Agent (alarm threshold: >75%)
- Disk utilization via CloudWatch Agent (monitoring root filesystem)

**Application Load Balancer:**
- Request count
- HTTP 5xx error count (alarm threshold: >10 errors in 5 minutes)
- Response times

**RDS Database:**
- CPU utilization (alarm threshold: >75%)
- Freeable memory (alarm threshold: <500MB)
- Database connections
- Disk I/O (read/write IOPS, latency, throughput)
- Network throughput

**Why this design:**
- **CloudWatch Agent on EC2 instances** provides visibility into memory and disk metrics not available by default
- **Metric-based alarms** enable proactive issue detection before users are impacted
- **SNS integration** allows email, SMS, or automated remediation responses
- **Log aggregation** simplifies debugging across multiple instances
- **30-day log retention** balances cost and audit requirements

**CloudWatch Insights Queries:**
Available for advanced log analysis, including:
- Request performance analysis (endpoint duration, database query timing)
- Error rate tracking
- Payload size distribution

### 7. IAM Roles & Policies

**What it is:** Identity and Access Management controls defining permissions for AWS services.

**Roles Created:**

**Elastic Beanstalk Service Role:**
- Allows EB to manage EC2, load balancers, and auto-scaling
- AWS managed policies: `AWSElasticBeanstalkService`, `AWSElasticBeanstalkEnhancedHealth`

**EC2 Instance Profile:**
- Used by EB instances to access AWS services
- Permissions for:
  - Pulling Docker images from ECR
  - Reading secrets from Secrets Manager
  - Writing logs to CloudWatch
  - Pushing custom metrics via CloudWatch Agent
  - SSM Session Manager (for secure shell access)

**Why this design:**
- **Principle of least privilege** ensures each component has only necessary permissions
- **Service roles** eliminate need for hardcoded AWS credentials
- **Instance profiles** automatically provide credentials to applications running on EC2
- **SSM Session Manager** provides secure shell access without managing SSH keys

## Infrastructure State Management

### Terraform State Backend

**What it is:** S3 bucket and DynamoDB table for storing and locking Terraform state.

**Bootstrap Resources:**
- S3 bucket: `finishline-terraform-state`
  - Versioning enabled for state history
  - Encryption enabled
  - All public access blocked
  - Lifecycle policy to delete old versions after 90 days
- DynamoDB table: `finishline-terraform-locks`
  - On-demand billing
  - Prevents concurrent Terraform operations

**Why this design:**
- **Remote state** enables team collaboration and CI/CD integration
- **State locking** prevents race conditions when multiple users/processes run Terraform
- **Versioning** provides rollback capability for state corruption
- **Encryption** protects sensitive values in state file (database passwords, API keys)

## Security Considerations

### Network Security

1. **Database in private subnet:** RDS has no public IP and cannot be accessed directly from internet
2. **Security group restrictions:** Each component only accepts traffic from authorized sources
3. **Application Load Balancer:** Single entry point for external traffic with HTTPS termination
4. **HTTPS enforcement:** ALB can redirect HTTP to HTTPS (when SSL certificate configured)

### Secret Management

1. **No secrets in code:** All sensitive values stored in AWS Secrets Manager
2. **Environment variable injection:** Secrets passed to application at runtime, never committed to Git
3. **IAM-based access control:** Only authorized services can read secrets
4. **Terraform variable protection:** Secrets passed via environment variables, marked as sensitive

### Access Control

1. **SSH via SSM:** EC2 instances accessible via AWS Systems Manager Session Manager (no SSH keys required)
2. **Database tunneling:** RDS access only via SSH tunnel through EB instances
3. **IAM role separation:** Different roles for service management vs. application runtime
4. **Deletion protection:** RDS has deletion protection enabled to prevent accidental data loss

### Monitoring & Compliance

1. **CloudWatch Logs:** All application and platform logs centralized
2. **CloudWatch Alarms:** Automated alerting for security and performance issues
3. **Automated backups:** RDS daily backups with 7-day retention
4. **Resource tagging:** All resources tagged with Project, Environment, ManagedBy for tracking

## Module Structure

The infrastructure is organized into reusable Terraform modules:

```
infrastructure/
├── bootstrap/          # One-time setup for Terraform state backend
├── environments/
│   └── production/     # Production environment configuration
└── modules/
    ├── network/        # VPC, subnets, security groups
    ├── rds/           # PostgreSQL database
    ├── elasticbeanstalk/  # Backend application hosting
    ├── amplify-frontend/  # Frontend hosting and CI/CD
    ├── iam/           # Roles and policies
    ├── secrets/       # Secrets Manager integration
    ├── monitoring/    # CloudWatch dashboards and alarms
    ├── dns/           # Route53 and ACM certificates
    └── ecr/           # Docker image registry
```

**Why this structure:**
- **Modules enable reusability:** Same modules can be used for staging/production environments
- **Separation of concerns:** Each module has a single responsibility
- **Environment-specific overrides:** Production can have different variables than staging
- **Bootstrap separation:** One-time setup isolated from regular infrastructure

## Cost Optimization

Current cost-saving measures:
- ARM-based RDS instances (t4g.medium) for better price/performance
- Single-AZ RDS deployment (Multi-AZ doubles cost)
- On-demand DynamoDB billing (pay only for state lock operations)
- CloudWatch Logs 30-day retention (not indefinite)
- Elastic Beanstalk auto-scaling with minimum 1 instance

Future optimization opportunities:
- Consider t3.micro EB instances if memory usage remains under 40%
- Enable Amplify PR preview only when needed (generates build minutes)
- Review CloudWatch log retention policies

## Disaster Recovery

**Backup Strategy:**
- RDS automated daily backups with 7-day retention
- RDS point-in-time recovery (5-minute RPO)
- Terraform state versioning in S3
- Docker images stored in ECR with lifecycle policies

**Recovery Procedures:**
- Database restore from automated backup or snapshot
- Terraform state recovery from S3 versions
- Application redeploy from ECR images or GitHub source

**RPO/RTO Targets:**
- Database Recovery Point Objective: 5 minutes (via PITR)
- Database Recovery Time Objective: ~30 minutes (restore time)
- Application Recovery Time Objective: ~15 minutes (redeploy)

## Monitoring Strategy

### Key Performance Indicators

1. **Application Health:**
   - ALB 5xx error rate (should be <1%)
   - ALB request count and latency
   - EB instance health checks

2. **Database Performance:**
   - RDS CPU utilization (should stay <60% sustained)
   - Database connections (monitor for connection leaks)
   - Query latency (via Performance Insights)

3. **Resource Utilization:**
   - EC2 CPU utilization (target 30-50% average for cost efficiency)
   - EC2 memory utilization (should stay <70%)
   - RDS freeable memory (should stay >1GB)

### Alarm Response

All CloudWatch alarms send notifications to SNS topic, which can be configured to:
- Send email notifications to team
- Trigger automated remediation (Lambda functions)
- Integrate with PagerDuty or other on-call systems
- Post to Slack channels

## Future Enhancements

Potential infrastructure improvements:
1. **Multi-environment setup:** Add staging environment using same modules
2. **Blue/green deployments:** Zero-downtime database migrations
3. **CloudFront for backend:** Cache static API responses at edge
4. **ElastiCache:** Redis for session storage and caching
5. **S3 for file storage:** Replace Google Drive integration with S3
6. **WAF integration:** Web Application Firewall for ALB
7. **Scheduled RDS snapshots:** Additional backup layer before major changes
8. **Multi-AZ RDS:** Enable for true high availability (adds cost)
9. **Infrastructure testing:** Terratest for automated infrastructure tests
10. **Secret rotation:** Automate periodic password and token rotation
