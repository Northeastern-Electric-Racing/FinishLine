# FinishLine Infrastructure User Guide

This guide covers how to work with the FinishLine AWS infrastructure, from initial setup through day-to-day operations.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Infrastructure Deployment](#infrastructure-deployment)
4. [Database Access via SSH Tunnel](#database-access-via-ssh-tunnel)
5. [Monitoring and Logs](#monitoring-and-logs)
6. [Deployment Process](#deployment-process)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

Install the following tools before proceeding:

```bash
# Terraform (Infrastructure as Code)
brew install terraform

# AWS CLI (AWS command-line interface)
brew install awscli

# PostgreSQL client (for database access)
brew install postgresql@16

# jq (JSON parsing for scripts)
brew install jq
```

### AWS Account Setup

1. **Create/Access AWS Account:**
   - Production uses the NER AWS account
   - Request access from the software lead

2. **Configure AWS CLI:**
   ```bash
   aws configure
   ```
   Enter your:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region: `us-east-1`
   - Default output format: `json`

3. **Verify AWS Access:**
   ```bash
   aws sts get-caller-identity
   ```
   Should display your AWS account and user information.

### SSH Key Setup for EB Instances

Generate an SSH key pair for accessing Elastic Beanstalk instances:

```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/aws-eb -C "your-email@example.com"

# Set proper permissions
chmod 400 ~/.ssh/aws-eb

# Import public key to AWS
aws ec2 import-key-pair \
  --key-name aws-eb \
  --public-key-material fileb://~/.ssh/aws-eb.pub
```

### Environment Variables for Secrets

Create a file `~/.finishline-secrets.env` with the following content:

```bash
# Database
export TF_VAR_db_master_password="your-secure-password"

# Application
export TF_VAR_session_secret=$(openssl rand -base64 32)
export TF_VAR_encryption_key=$(openssl rand -base64 32)

# Google OAuth and APIs
export TF_VAR_google_client_id="xxxx.apps.googleusercontent.com"
export TF_VAR_google_client_secret="GOCSPX-xxxxx"
export TF_VAR_drive_refresh_token="1//xxxxx"
export TF_VAR_calendar_refresh_token="1//xxxxx"
export TF_VAR_google_drive_folder_id="xxxx"

# Slack Integration
export TF_VAR_slack_id="xxxxx"
export TF_VAR_slack_bot_token="xoxb-xxxxx"
export TF_VAR_slack_token_secret="xxxxx"
export TF_VAR_slack_signing_secret="xxxxx"

# Notification Endpoint
export TF_VAR_notification_endpoint_secret=$(openssl rand -base64 32)

# GitHub (for Amplify)
export TF_VAR_github_access_token="ghp_xxxxx"

# User Configuration
export TF_VAR_user_email="your-email@example.com"
export TF_VAR_admin_user_id="your-admin-id"
export TF_VAR_clarity_project_id="xxxxx"
```

Load secrets before running Terraform:
```bash
source ~/.finishline-secrets.env
```

## Initial Setup

### Step 1: Bootstrap Terraform State Backend

The bootstrap creates the S3 bucket and DynamoDB table for storing Terraform state. **This only needs to be done once per AWS account.**

```bash
cd infrastructure/bootstrap

# Initialize Terraform
terraform init

# Review what will be created
terraform plan

# Create the state backend resources
terraform apply

# Outputs will show bucket and table names
# Example:
# state_bucket_name = "finishline-terraform-state"
# locks_table_name = "finishline-terraform-locks"
```

**Important:** After running bootstrap, **do not delete** the state file (`terraform.tfstate`) in the bootstrap directory. This is stored locally and is needed to manage the state backend infrastructure.

### Step 2: Configure Production Environment

```bash
cd infrastructure/environments/production

# Copy the example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your configuration
# Most values have sensible defaults; only change if needed
```

Key variables to review in `terraform.tfvars`:
- `eb_instance_type`: Default `t3.small` (can downsize to `t3.micro` if memory usage is consistently low)
- `rds_multi_az`: Default `false` (set to `true` for high availability, doubles cost)
- `use_custom_domain`: Set to `true` if using custom domain
- `hosted_zone_name`: Your Route53 domain (if using custom domain)

### Step 3: Deploy Infrastructure

```bash
cd infrastructure/environments/production

# Load secrets
source ~/.finishline-secrets.env

# Initialize Terraform (downloads providers and modules)
terraform init

# Review the execution plan
terraform plan

# Apply the infrastructure
# This will take 10-15 minutes on first run
terraform apply

# Type 'yes' when prompted
```

**What gets created:**
- VPC with public/private subnets
- RDS PostgreSQL database
- Elastic Beanstalk environment
- Application Load Balancer
- Security groups
- IAM roles and instance profiles
- CloudWatch dashboards and alarms
- Secrets in AWS Secrets Manager
- AWS Amplify app for frontend
- ECR repository for Docker images

**Important Outputs:**
After apply completes, Terraform outputs important values:
```
eb_environment_name = "finishline-production-env"
rds_endpoint = "finishline-production-db.xxx.us-east-1.rds.amazonaws.com"
alb_dns_name = "finishline-production-xxx.us-east-1.elb.amazonaws.com"
amplify_app_url = "https://main.xxxxx.amplifyapp.com"
```

Save these values for later use.

## Database Access via SSH Tunnel

The RDS database is in a private subnet and not publicly accessible. To connect, create an SSH tunnel through an Elastic Beanstalk instance.

### Using the Tunnel Script

A convenience script is provided for easy tunneling:

```bash
cd infrastructure/scripts

# Make script executable (first time only)
chmod +x tunnel-to-rds.sh

# Create tunnel (runs in foreground)
./tunnel-to-rds.sh
```

**What the script does:**
1. Finds the RDS endpoint from AWS
2. Identifies a running EB instance
3. Gets the instance's public IP
4. Creates SSH tunnel: `localhost:5434` → `RDS:5432`

**Output example:**
```
✅ RDS Endpoint: finishline-production-db.xxx.us-east-1.rds.amazonaws.com
✅ Found instance: i-0123456789abcdef0
✅ Instance IP: 3.123.45.67

🚇 Creating SSH tunnel...
Tunnel Details:
  Local Port:    localhost:5434
  RDS Endpoint:  finishline-production-db.xxx.us-east-1.rds.amazonaws.com:5432
  Via Instance:  3.123.45.67
```

### Connecting to Database

Once the tunnel is running (in one terminal), open a **new terminal** and connect:

```bash
# Using psql
psql -h localhost -p 5434 -U postgres -d finishline

# Or using connection string
psql postgresql://postgres:YOUR_PASSWORD@localhost:5434/finishline

# Or using environment variable
export PGPASSWORD="your-db-password"
psql -h localhost -p 5434 -U postgres -d finishline
```

**Note:** Replace `YOUR_PASSWORD` with the value from `TF_VAR_db_master_password`.

### Common Database Operations

```sql
-- List all tables
\dt

-- Describe a table
\d table_name

-- Run queries
SELECT * FROM "User" LIMIT 10;

-- Check database size
SELECT pg_size_pretty(pg_database_size('finishline'));

-- Exit psql
\q
```

### Closing the Tunnel

In the terminal running the tunnel script, press `Ctrl+C` to close the connection.

### Manual Tunnel (without script)

If the script doesn't work, create tunnel manually:

```bash
# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier finishline-production-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

# Get EB instance ID
INSTANCE_ID=$(aws elasticbeanstalk describe-environment-resources \
  --environment-name finishline-production-env \
  --query 'EnvironmentResources.Instances[0].Id' \
  --output text)

# Get instance IP
INSTANCE_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

# Create tunnel
ssh -i ~/.ssh/aws-eb \
    -o StrictHostKeyChecking=no \
    -L 5434:$RDS_ENDPOINT:5432 \
    ec2-user@$INSTANCE_IP
```

## Monitoring and Logs

### CloudWatch Dashboard

View real-time metrics and historical data:

1. Navigate to CloudWatch in AWS Console
2. Click "Dashboards" in left sidebar
3. Select `finishline-production-dashboard`

**Dashboard includes:**
- EC2 CPU and memory utilization
- ALB request count and error rates
- RDS performance metrics (CPU, IOPS, connections, latency)
- Disk utilization

### CloudWatch Alarms

View active alarms and alarm history:

1. Navigate to CloudWatch → Alarms
2. Filter by tag: `Project=finishline`

**Configured alarms:**
- EB CPU high (>80%)
- EB memory high (>75%)
- ALB HTTP 5xx errors (>10 in 5 minutes)
- RDS CPU high (>75%)
- RDS memory low (<500MB)
- RDS read latency high (>10ms)

Alarms send notifications to the SNS topic: `finishline-production-alerts`

### Application Logs

#### Via AWS Console

1. Navigate to CloudWatch → Log groups
2. Select log group:
   - `/aws/elasticbeanstalk/finishline-production/var/log/eb-docker/containers/eb-current-app/` - Application logs
   - `/aws/elasticbeanstalk/finishline-production-env` - Platform logs

3. Select a log stream (one per EB instance)
4. View logs in real-time

#### Via AWS CLI

```bash
# Tail application logs
aws logs tail /aws/elasticbeanstalk/finishline-production/var/log/eb-docker/containers/eb-current-app/stdouterr.log --follow

# Get last 100 log lines
aws logs tail /aws/elasticbeanstalk/finishline-production/var/log/eb-docker/containers/eb-current-app/stdouterr.log --since 1h

# Search logs for errors
aws logs filter-log-events \
  --log-group-name /aws/elasticbeanstalk/finishline-production/var/log/eb-docker/containers/eb-current-app/stdouterr.log \
  --filter-pattern "ERROR"
```

### CloudWatch Insights Queries

Advanced log analysis with SQL-like queries:

1. Navigate to CloudWatch → Logs Insights
2. Select log group
3. Run queries:

**Query: Request performance analysis**
```
fields @timestamp, message
| filter message like /endpoint_performance/
| parse message /duration=(?<duration>\d+)ms/
| stats avg(duration), max(duration), min(duration) by bin(5m)
```

**Query: Error rate analysis**
```
fields @timestamp, @message
| filter @message like /ERROR/
| stats count() by bin(5m)
```

**Query: Database query performance**
```
fields @timestamp, message
| filter message like /db_query_time/
| parse message /time=(?<time>\d+)ms/
| stats avg(time), max(time), p95(time), p99(time)
```

### SSH into EB Instance

Sometimes you need direct access to an instance for debugging:

```bash
cd infrastructure/scripts

# Make script executable (first time only)
chmod +x ssh-to-eb.sh

# SSH into instance
./ssh-to-eb.sh
```

**Once connected:**
```bash
# View running containers
docker ps

# View container logs
docker logs <container-id>

# Follow container logs
docker logs -f <container-id>

# View EB platform logs
sudo tail -f /var/log/eb-engine.log
sudo tail -f /var/log/eb-activity.log

# View CloudWatch Agent status
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a query -m ec2 -c default -s

# Exit
exit
```

## Deployment Process

### Backend Deployment

Backend deployments are automated via GitHub Actions CI/CD:

1. **Trigger:** Push to main branch or merge PR
2. **CI/CD Pipeline:**
   - Runs tests
   - Builds Docker image
   - Pushes image to ECR with tag `latest`
   - Updates EB environment with new image

3. **Deployment Process:**
   - EB creates new EC2 instances with new Docker image
   - Performs health checks on new instances
   - Gradually shifts traffic from old to new instances (rolling deployment)
   - Terminates old instances after health checks pass

4. **Monitor Deployment:**
   ```bash
   # View deployment events
   aws elasticbeanstalk describe-events \
     --environment-name finishline-production-env \
     --max-items 20

   # Check environment status
   aws elasticbeanstalk describe-environments \
     --environment-names finishline-production-env \
     --query 'Environments[0].Status'
   ```

### Frontend Deployment

Frontend deployments are automated via AWS Amplify:

1. **Trigger:** Push to main branch
2. **Build Process:**
   - Amplify detects GitHub push via webhook
   - Clones repository
   - Installs dependencies (`yarn install`)
   - Builds shared package, then frontend package
   - Deploys to CDN

3. **Monitor Deployment:**
   - Navigate to AWS Amplify console
   - Select `finishline-production-frontend` app
   - Click on build in progress to view logs

4. **View Deployment Status:**
   ```bash
   # List recent builds
   aws amplify list-jobs \
     --app-id <app-id> \
     --branch-name main \
     --max-results 5

   # Get specific build details
   aws amplify get-job \
     --app-id <app-id> \
     --branch-name main \
     --job-id <job-id>
   ```

## Common Tasks

### Update Environment Variables

To add or modify environment variables for the backend:

1. Edit `infrastructure/environments/production/main.tf`:
   ```hcl
   environment_variables = {
     # Add your new variable
     NEW_VARIABLE = "value"
     # ... existing variables
   }
   ```

2. Apply changes:
   ```bash
   cd infrastructure/environments/production
   source ~/.finishline-secrets.env
   terraform apply
   ```

3. EB will automatically restart instances with new variables

### Rotate Secrets

To update a secret (e.g., database password):

1. Update the secret value in `~/.finishline-secrets.env`
2. Apply Terraform:
   ```bash
   source ~/.finishline-secrets.env
   terraform apply
   ```
3. Terraform will update AWS Secrets Manager
4. Restart EB environment to pick up new secret:
   ```bash
   aws elasticbeanstalk restart-app-server \
     --environment-name finishline-production-env
   ```

### Scale EB Instances

Temporarily increase capacity:

```bash
# Via AWS Console:
# Elastic Beanstalk → Environments → Configuration → Capacity
# Update Min/Max instances

# Via CLI:
aws elasticbeanstalk update-environment \
  --environment-name finishline-production-env \
  --option-settings \
    Namespace=aws:autoscaling:asg,OptionName=MinSize,Value=2 \
    Namespace=aws:autoscaling:asg,OptionName=MaxSize,Value=6
```

For permanent changes, update `terraform.tfvars`:
```hcl
eb_min_instances = 2
eb_max_instances = 6
```

Then apply: `terraform apply`

### Create Database Backup (Manual)

```bash
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier finishline-production-db \
  --db-snapshot-identifier finishline-manual-backup-$(date +%Y%m%d)

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier finishline-production-db

# Restore from snapshot (creates new instance)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier finishline-production-db-restored \
  --db-snapshot-identifier finishline-manual-backup-20240315
```

### View Resource Costs

```bash
# Via AWS Console:
# AWS Cost Explorer → Cost & Usage Reports

# Via CLI (requires Cost Explorer enabled):
aws ce get-cost-and-usage \
  --time-period Start=2024-03-01,End=2024-03-31 \
  --granularity MONTHLY \
  --metrics UnblendedCost \
  --group-by Type=TAG,Key=Project \
  --filter file://filter.json

# filter.json:
# {
#   "Tags": {
#     "Key": "Project",
#     "Values": ["finishline"]
#   }
# }
```

### Update Terraform Modules

When module code changes (e.g., changes to `modules/elasticbeanstalk/main.tf`):

```bash
cd infrastructure/environments/production

# Re-initialize to get module changes
terraform init -upgrade

# Review changes
terraform plan

# Apply changes
terraform apply
```

## Troubleshooting

### Problem: Terraform Apply Fails

**Symptom:** `terraform apply` exits with errors

**Solutions:**

1. **Check AWS credentials:**
   ```bash
   aws sts get-caller-identity
   ```

2. **Check Terraform version:**
   ```bash
   terraform version
   # Should be >= 1.0
   ```

3. **Re-initialize:**
   ```bash
   terraform init -upgrade
   ```

4. **Check state lock:**
   ```bash
   # If state is locked, manually unlock (use with caution!)
   terraform force-unlock <lock-id>
   ```

5. **Check resource quotas:**
   - Navigate to AWS Service Quotas
   - Verify you haven't hit limits (e.g., VPC limit, EIP limit)

### Problem: EB Environment Unhealthy

**Symptom:** EB environment shows "Degraded" or "Severe" health

**Diagnosis:**

1. **Check EB console:**
   - Navigate to Elastic Beanstalk → Environments
   - Click on environment name
   - Review "Health" and "Causes" sections

2. **Check application logs:**
   ```bash
   aws logs tail /aws/elasticbeanstalk/finishline-production/var/log/eb-docker/containers/eb-current-app/stdouterr.log --follow
   ```

3. **SSH into instance:**
   ```bash
   ./infrastructure/scripts/ssh-to-eb.sh
   docker logs <container-id>
   ```

**Common causes:**

- **Application crash:** Check logs for errors
- **Health check failure:** Verify `/health` endpoint responds
- **Memory exhaustion:** Check CloudWatch memory metrics
- **Database connection failure:** Verify RDS is running and accessible

**Resolution:**

```bash
# Restart application servers
aws elasticbeanstalk restart-app-server \
  --environment-name finishline-production-env

# If restart doesn't help, rebuild environment
aws elasticbeanstalk rebuild-environment \
  --environment-name finishline-production-env
```

### Problem: Cannot Connect to Database

**Symptom:** Tunnel script fails or psql connection refused

**Solutions:**

1. **Verify EB instance is running:**
   ```bash
   aws elasticbeanstalk describe-environment-resources \
     --environment-name finishline-production-env
   ```

2. **Verify RDS is available:**
   ```bash
   aws rds describe-db-instances \
     --db-instance-identifier finishline-production-db \
     --query 'DBInstances[0].DBInstanceStatus'
   ```

3. **Check security groups:**
   - RDS security group should allow inbound 5432 from EB security group
   - Use Terraform output: `terraform output` to verify security group IDs

4. **Verify SSH key:**
   ```bash
   ls -la ~/.ssh/aws-eb
   # Should show -r-------- (400 permissions)
   ```

5. **Test SSH connection:**
   ```bash
   ./infrastructure/scripts/ssh-to-eb.sh
   # Should successfully connect
   ```

### Problem: Deployment Stuck or Failed

**Symptom:** GitHub Actions deployment hangs or fails

**Diagnosis:**

1. **Check GitHub Actions logs:**
   - Navigate to repository → Actions
   - Click on failed workflow
   - Review build and deployment logs

2. **Check EB deployment events:**
   ```bash
   aws elasticbeanstalk describe-events \
     --environment-name finishline-production-env \
     --max-items 50
   ```

3. **Check Docker image:**
   ```bash
   # Verify image exists in ECR
   aws ecr describe-images \
     --repository-name finishline \
     --image-ids imageTag=latest
   ```

**Common causes:**

- **Docker build failure:** Review GitHub Actions logs
- **Health check timeout:** Increase timeout in `01_healthcheck.config`
- **Resource limits:** Instance out of memory or disk space
- **Database migration failure:** Check application logs

**Resolution:**

```bash
# Abort deployment and rollback
aws elasticbeanstalk abort-environment-update \
  --environment-name finishline-production-env

# Check health after abort
aws elasticbeanstalk describe-environment-health \
  --environment-name finishline-production-env \
  --attribute-names All
```

### Problem: High CloudWatch Costs

**Symptom:** AWS bill shows high CloudWatch charges

**Common causes:**

- Log ingestion volume too high
- Too many custom metrics
- Long log retention periods

**Solutions:**

1. **Review log retention:**
   ```bash
   cd infrastructure/environments/production
   # Edit main.tf or variables.tf
   # Change log_retention_days from 30 to 7
   terraform apply
   ```

2. **Filter logs:**
   - Add log filtering in application to reduce log volume
   - Use log sampling for high-volume endpoints

3. **Review custom metrics:**
   - Check CloudWatch Agent configuration in `.ebextensions/02_cloudwatch_agent.config`
   - Reduce collection frequency if needed

### Problem: Out of Disk Space

**Symptom:** EB instance shows high disk utilization (>90%)

**Diagnosis:**

1. **Check CloudWatch disk metrics**
2. **SSH into instance:**
   ```bash
   ./infrastructure/scripts/ssh-to-eb.sh
   df -h
   ```

**Common causes:**

- Docker image layers accumulating
- Application logs filling disk
- Temporary files not cleaned up

**Resolution:**

```bash
# On EB instance:

# Clean up Docker
sudo docker system prune -a --volumes -f

# Clean up old logs
sudo journalctl --vacuum-time=2d

# Check what's using space
sudo du -sh /* | sort -h
```

**Prevention:**
- Configure Docker log rotation in Dockerrun.aws.json
- Add cron job to clean old Docker images

### Problem: Cannot Access AWS Console or CLI

**Symptom:** "Access Denied" errors

**Solutions:**

1. **Verify IAM permissions:**
   - User needs permissions for EC2, RDS, EB, CloudWatch, etc.
   - Attach `PowerUserAccess` policy or equivalent

2. **Check MFA requirements:**
   - Some accounts require MFA for sensitive operations

3. **Verify AWS region:**
   ```bash
   aws configure get region
   # Should be us-east-1
   ```

4. **Test specific service:**
   ```bash
   aws elasticbeanstalk describe-environments
   ```

### Problem: Terraform State Lock

**Symptom:** "Error acquiring state lock"

**Cause:** Previous Terraform operation was interrupted

**Resolution:**

```bash
# Check lock in DynamoDB
aws dynamodb get-item \
  --table-name finishline-terraform-locks \
  --key '{"LockID":{"S":"finishline-terraform-state/production/terraform.tfstate"}}'

# Force unlock (use with caution - ensure no other Terraform is running!)
terraform force-unlock <lock-id-from-error>

# Verify lock is released
aws dynamodb get-item \
  --table-name finishline-terraform-locks \
  --key '{"LockID":{"S":"finishline-terraform-state/production/terraform.tfstate"}}'
```

### Problem: Amplify Build Fails

**Symptom:** Frontend deployment fails in Amplify

**Diagnosis:**

1. **Check Amplify console:**
   - Navigate to Amplify → App → Build logs
   - Review provision, build, and deploy phases

2. **Common errors:**
   - Missing environment variables
   - Build script errors
   - Out of memory during build

**Solutions:**

1. **Update environment variables:**
   - Amplify console → App settings → Environment variables
   - Ensure `VITE_REACT_APP_BACKEND_URL` is set

2. **Increase build resources:**
   - Edit `amplify-frontend/main.tf`:
   ```hcl
   environment_variables = {
     NODE_OPTIONS = "--max-old-space-size=8192"  # Increase from 4096
   }
   ```

3. **Clear cache and retry:**
   - Amplify console → App → Redeploy

### Getting Help

If issues persist:

1. **Check AWS Service Health Dashboard:** https://status.aws.amazon.com/
2. **Review AWS Documentation:** https://docs.aws.amazon.com/
3. **Contact Team:**
   - Slack: #software channel
   - Tag: @software-lead
4. **AWS Support:**
   - For production issues, open AWS Support case
   - Include: Account ID, resource IDs, error messages, timestamps

## Best Practices

### Security

- Never commit secrets to Git
- Rotate secrets regularly (quarterly minimum)
- Use SSM Session Manager instead of SSH when possible
- Review CloudWatch alarms weekly
- Keep Terraform and provider versions updated

### Operations

- Always run `terraform plan` before `apply`
- Tag all resources consistently
- Document infrastructure changes in PRs
- Monitor costs monthly
- Test changes in staging before production (when staging exists)

### Development Workflow

1. Make infrastructure changes in feature branch
2. Run `terraform plan` to review changes
3. Create PR with infrastructure changes
4. Get approval from team lead
5. Merge to main
6. Apply changes in production
7. Monitor deployments and CloudWatch alarms

### Backup and Recovery

- Test database restore quarterly
- Keep local copy of Terraform state backup
- Document recovery procedures
- Practice disaster recovery scenarios

## Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [AWS CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [FinishLine Architecture Documentation](./ARCHITECTURE.md)
