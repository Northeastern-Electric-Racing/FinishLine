#!/bin/bash
# Script to create SSH tunnel to RDS through EB instance
# Usage: ./tunnel-to-rds.sh

set -e

# Configuration
ENV_NAME="finishline-production-env"
DB_IDENTIFIER="finishline-production-db"
KEY_PATH="~/.ssh/aws-eb"
LOCAL_PORT=5434

echo "🔍 Finding RDS endpoint..."
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier $DB_IDENTIFIER \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

if [ -z "$RDS_ENDPOINT" ] || [ "$RDS_ENDPOINT" == "None" ]; then
  echo "❌ Could not find RDS endpoint for $DB_IDENTIFIER"
  exit 1
fi

echo "✅ RDS Endpoint: $RDS_ENDPOINT"
echo ""

echo "🔍 Finding running EB instance..."
INSTANCE_ID=$(aws elasticbeanstalk describe-environment-resources \
  --environment-name $ENV_NAME \
  --query 'EnvironmentResources.Instances[0].Id' \
  --output text)

if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" == "None" ]; then
  echo "❌ No running instances found in environment $ENV_NAME"
  exit 1
fi

echo "✅ Found instance: $INSTANCE_ID"
echo ""

echo "🔍 Getting instance public IP..."
INSTANCE_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

if [ -z "$INSTANCE_IP" ] || [ "$INSTANCE_IP" == "None" ]; then
  echo "❌ Could not get public IP for instance $INSTANCE_ID"
  exit 1
fi

echo "✅ Instance IP: $INSTANCE_IP"
echo ""

# Expand tilde in key path
KEY_PATH_EXPANDED="${KEY_PATH/#\~/$HOME}"

# Check if key file exists
if [ ! -f "$KEY_PATH_EXPANDED" ]; then
  echo "❌ SSH key not found at $KEY_PATH_EXPANDED"
  exit 1
fi

# Check key permissions
KEY_PERMS=$(stat -f "%A" "$KEY_PATH_EXPANDED" 2>/dev/null || stat -c "%a" "$KEY_PATH_EXPANDED" 2>/dev/null)
if [ "$KEY_PERMS" != "400" ] && [ "$KEY_PERMS" != "600" ]; then
  echo "⚠️  Warning: SSH key has permissions $KEY_PERMS, should be 400 or 600"
  echo "   Run: chmod 400 $KEY_PATH_EXPANDED"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚇 Creating SSH tunnel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Tunnel Details:"
echo "  Local Port:    localhost:$LOCAL_PORT"
echo "  RDS Endpoint:  $RDS_ENDPOINT:5432"
echo "  Via Instance:  $INSTANCE_IP"
echo ""
echo "Once connected, open a NEW terminal and run:"
echo "  psql -h localhost -p $LOCAL_PORT -U postgres -d finishline"
echo ""
echo "Or use connection string:"
echo "  psql postgresql://postgres:YOUR_PASSWORD@localhost:$LOCAL_PORT/finishline"
echo ""
echo "To exit psql: \\q or Ctrl+D"
echo "To close tunnel: Press Ctrl+C in this window"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create the SSH tunnel
ssh -i "$KEY_PATH_EXPANDED" \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -L $LOCAL_PORT:$RDS_ENDPOINT:5432 \
    ec2-user@$INSTANCE_IP
