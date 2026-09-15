#!/bin/bash
# Script to SSH into an EB instance
# Usage: ./ssh-to-eb.sh

set -e

# Configuration
ENV_NAME="finishline-production-env"
KEY_PATH="~/.ssh/aws-eb"

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
echo "🔌 Connecting to EB instance..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Instance: $INSTANCE_IP ($INSTANCE_ID)"
echo "Direct SSH: ssh -i $KEY_PATH_EXPANDED ec2-user@$INSTANCE_IP"
echo "User: ec2-user"
echo ""
echo "Useful commands once connected:"
echo "  docker ps                    # See running containers"
echo "  docker logs <container-id>   # View container logs"
echo "  sudo tail -f /var/log/eb-*   # View EB logs"
echo ""
echo "To exit: type 'exit' or press Ctrl+D"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# SSH into the instance
ssh -i "$KEY_PATH_EXPANDED" \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    ec2-user@$INSTANCE_IP
