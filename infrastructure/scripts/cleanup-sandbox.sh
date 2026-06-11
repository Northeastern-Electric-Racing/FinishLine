#!/usr/bin/env bash
# Tag-based cleanup safety net for the sandbox environment.
# Runs after `terraform destroy` to catch any resources Terraform missed.
# Deletes everything tagged Environment=sandbox in us-east-2.
#
# Deletion order matters for VPC teardown:
#   EB environment → RDS → IGW detach → subnets → route table rules →
#   route tables → security group rules → security groups → VPC

set -euo pipefail

REGION="us-east-2"
TAG_KEY="Environment"
TAG_VALUE="sandbox"

log() { echo "[cleanup] $*"; }

ids_for() {
  # $1 = resource-type  $2+ = filters
  aws ec2 describe-"$1" \
    --region "$REGION" \
    --filters "Name=tag:$TAG_KEY,Values=$TAG_VALUE" "$@" \
    --query '*[].["'$( [[ "$1" == *s ]] && echo "${1%s}Id" || echo "${1}Id" )'"]' \
    --output text 2>/dev/null | tr '\t' '\n' | grep -v '^$' || true
}

#####################
# Elastic Beanstalk
#####################
log "Terminating sandbox EB environments..."
for env in $(aws elasticbeanstalk describe-environments \
    --region "$REGION" \
    --query "Environments[?Tags[?Key=='$TAG_KEY' && Value=='$TAG_VALUE']].EnvironmentName" \
    --output text 2>/dev/null || true); do
  log "  Terminating EB environment: $env"
  aws elasticbeanstalk terminate-environment \
    --environment-name "$env" \
    --region "$REGION" || true
done

# Wait for EB environments to finish terminating before touching VPC resources
for env in $(aws elasticbeanstalk describe-environments \
    --region "$REGION" \
    --query "Environments[?Tags[?Key=='$TAG_KEY' && Value=='$TAG_VALUE'] && Status!='Terminated'].EnvironmentName" \
    --output text 2>/dev/null || true); do
  log "  Waiting for EB environment to terminate: $env"
  aws elasticbeanstalk wait environment-terminated \
    --environment-name "$env" \
    --region "$REGION" || true
done

#####################
# RDS Instances
#####################
log "Deleting sandbox RDS instances..."
for db in $(aws rds describe-db-instances \
    --region "$REGION" \
    --query "DBInstances[?TagList[?Key=='$TAG_KEY' && Value=='$TAG_VALUE']].DBInstanceIdentifier" \
    --output text 2>/dev/null || true); do
  log "  Deleting RDS instance: $db"
  aws rds delete-db-instance \
    --db-instance-identifier "$db" \
    --skip-final-snapshot \
    --region "$REGION" || true
  aws rds wait db-instance-deleted \
    --db-instance-identifier "$db" \
    --region "$REGION" || true
done

log "Deleting sandbox DB subnet groups..."
for sg in $(aws rds describe-db-subnet-groups \
    --region "$REGION" \
    --query "DBSubnetGroups[?Tags[?Key=='$TAG_KEY' && Value=='$TAG_VALUE']].DBSubnetGroupName" \
    --output text 2>/dev/null || true); do
  log "  Deleting DB subnet group: $sg"
  aws rds delete-db-subnet-group \
    --db-subnet-group-name "$sg" \
    --region "$REGION" || true
done

#####################
# CloudWatch Log Groups
#####################
log "Deleting sandbox CloudWatch log groups..."
for lg in $(aws logs describe-log-groups \
    --region "$REGION" \
    --log-group-name-prefix "/aws/elasticbeanstalk/finishline-sandbox" \
    --query "logGroups[].logGroupName" \
    --output text 2>/dev/null || true); do
  log "  Deleting log group: $lg"
  aws logs delete-log-group --log-group-name "$lg" --region "$REGION" || true
done

#####################
# VPC Resources
# Must delete in dependency order: IGW → subnets → route table associations
# → non-main route tables → security group rules → security groups → VPC
#####################
for vpc in $(aws ec2 describe-vpcs \
    --region "$REGION" \
    --filters "Name=tag:$TAG_KEY,Values=$TAG_VALUE" \
    --query "Vpcs[].VpcId" \
    --output text 2>/dev/null || true); do

  log "Cleaning up VPC: $vpc"

  # Detach and delete internet gateways
  for igw in $(aws ec2 describe-internet-gateways \
      --region "$REGION" \
      --filters "Name=attachment.vpc-id,Values=$vpc" \
      --query "InternetGateways[].InternetGatewayId" \
      --output text 2>/dev/null || true); do
    log "  Detaching IGW: $igw"
    aws ec2 detach-internet-gateway --internet-gateway-id "$igw" --vpc-id "$vpc" --region "$REGION" || true
    log "  Deleting IGW: $igw"
    aws ec2 delete-internet-gateway --internet-gateway-id "$igw" --region "$REGION" || true
  done

  # Delete subnets
  for subnet in $(aws ec2 describe-subnets \
      --region "$REGION" \
      --filters "Name=vpc-id,Values=$vpc" \
      --query "Subnets[].SubnetId" \
      --output text 2>/dev/null || true); do
    log "  Deleting subnet: $subnet"
    aws ec2 delete-subnet --subnet-id "$subnet" --region "$REGION" || true
  done

  # Delete non-main route tables
  for rt in $(aws ec2 describe-route-tables \
      --region "$REGION" \
      --filters "Name=vpc-id,Values=$vpc" \
      --query "RouteTables[?Associations[?Main==\`false\`] || !Associations].RouteTableId" \
      --output text 2>/dev/null || true); do
    log "  Deleting route table: $rt"
    aws ec2 delete-route-table --route-table-id "$rt" --region "$REGION" || true
  done

  # Revoke all security group rules, then delete non-default security groups
  for sg in $(aws ec2 describe-security-groups \
      --region "$REGION" \
      --filters "Name=vpc-id,Values=$vpc" \
      --query "SecurityGroups[?GroupName!='default'].GroupId" \
      --output text 2>/dev/null || true); do

    # Revoke ingress rules
    INGRESS=$(aws ec2 describe-security-group-rules \
      --region "$REGION" \
      --filters "Name=group-id,Values=$sg" \
      --query "SecurityGroupRules[?!IsEgress].SecurityGroupRuleId" \
      --output text 2>/dev/null || true)
    if [ -n "$INGRESS" ]; then
      aws ec2 revoke-security-group-ingress \
        --group-id "$sg" \
        --security-group-rule-ids $INGRESS \
        --region "$REGION" || true
    fi

    # Revoke egress rules
    EGRESS=$(aws ec2 describe-security-group-rules \
      --region "$REGION" \
      --filters "Name=group-id,Values=$sg" \
      --query "SecurityGroupRules[?IsEgress].SecurityGroupRuleId" \
      --output text 2>/dev/null || true)
    if [ -n "$EGRESS" ]; then
      aws ec2 revoke-security-group-egress \
        --group-id "$sg" \
        --security-group-rule-ids $EGRESS \
        --region "$REGION" || true
    fi
  done

  # Now delete the security groups (after rules are gone)
  for sg in $(aws ec2 describe-security-groups \
      --region "$REGION" \
      --filters "Name=vpc-id,Values=$vpc" \
      --query "SecurityGroups[?GroupName!='default'].GroupId" \
      --output text 2>/dev/null || true); do
    log "  Deleting security group: $sg"
    aws ec2 delete-security-group --group-id "$sg" --region "$REGION" || true
  done

  log "  Deleting VPC: $vpc"
  aws ec2 delete-vpc --vpc-id "$vpc" --region "$REGION" || true
done

#####################
# IAM (sandbox roles and instance profiles)
#####################
log "Deleting sandbox IAM resources..."
for profile in $(aws iam list-instance-profiles \
    --query "InstanceProfiles[?starts_with(InstanceProfileName,'finishline-sandbox-')].InstanceProfileName" \
    --output text 2>/dev/null || true); do
  for role in $(aws iam get-instance-profile \
      --instance-profile-name "$profile" \
      --query "InstanceProfile.Roles[].RoleName" \
      --output text 2>/dev/null || true); do
    aws iam remove-role-from-instance-profile \
      --instance-profile-name "$profile" --role-name "$role" || true
  done
  log "  Deleting instance profile: $profile"
  aws iam delete-instance-profile --instance-profile-name "$profile" || true
done

for role in $(aws iam list-roles \
    --query "Roles[?starts_with(RoleName,'finishline-sandbox-')].RoleName" \
    --output text 2>/dev/null || true); do
  for policy in $(aws iam list-role-policies --role-name "$role" --query PolicyNames[] --output text 2>/dev/null || true); do
    aws iam delete-role-policy --role-name "$role" --policy-name "$policy" || true
  done
  for arn in $(aws iam list-attached-role-policies --role-name "$role" --query "AttachedPolicies[].PolicyArn" --output text 2>/dev/null || true); do
    aws iam detach-role-policy --role-name "$role" --policy-arn "$arn" || true
  done
  log "  Deleting IAM role: $role"
  aws iam delete-role --role-name "$role" || true
done

log "Cleanup complete."
