#!/usr/bin/env bash
# ==============================================================================
# CloudBank — Automated AWS Deployment Script (Capital One Modernization)
# Group 41 · IT457 Cloud Computing
# Author: Aryan Rathod (202301164)
# ==============================================================================
# Deploys CloudBank to AWS Free Tier:
#   1. Amazon RDS PostgreSQL (db.t3.micro, 20 GB gp3)
#   2. Amazon EC2 (t3.micro, Ubuntu 22.04 LTS)
#   3. VPC Defense-in-Depth Security Groups
#   4. Database initialization (init.sql + seed.sql)
#   5. Docker Compose deployment (docker-compose.aws.yml)
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# Configuration Defaults (Override via environment variables if desired)
# ------------------------------------------------------------------------------
AWS_REGION="${AWS_REGION:-$(aws configure get region || echo "ap-south-1")}"
AWS_REGION="${AWS_REGION:-ap-south-1}"
EC2_INSTANCE_TYPE="t3.micro"
RDS_INSTANCE_CLASS="db.t3.micro"
RDS_DB_NAME="cloudbank"
RDS_MASTER_USER="cloudbank_admin"
RDS_MASTER_PASS="${RDS_MASTER_PASS:-CloudBank2026Secure}"
KEY_NAME="cloudbank-key"
KEY_FILE="${KEY_NAME}.pem"

echo "===================================================================="
echo "🏦 CloudBank AWS Deployment Initiated (Region: ${AWS_REGION})"
echo "===================================================================="

# ------------------------------------------------------------------------------
# 1. Verify AWS Identity & Permissions
# ------------------------------------------------------------------------------
echo "🔍 Checking AWS credentials..."
CALLER_ID=$(aws sts get-caller-identity --output json)
echo "✅ Authenticated as: $(echo "$CALLER_ID" | grep -o '"Arn": "[^"]*' | cut -d'"' -f4)"

# ------------------------------------------------------------------------------
# 2. Get Default VPC & Subnets
# ------------------------------------------------------------------------------
echo "🌐 Retrieving default VPC..."
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --region "$AWS_REGION" --query "Vpcs[0].VpcId" --output text)
if [ "$VPC_ID" == "None" ] || [ -z "$VPC_ID" ]; then
  echo "❌ Error: Default VPC not found in region ${AWS_REGION}. Please ensure your AWS account has a default VPC."
  exit 1
fi
echo "✅ Default VPC ID: ${VPC_ID}"

# ------------------------------------------------------------------------------
# 3. Create EC2 Security Group (cloudbank-ec2-sg)
# ------------------------------------------------------------------------------
echo "🔒 Configuring EC2 Security Group..."
EC2_SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=cloudbank-ec2-sg" "Name=vpc-id,Values=${VPC_ID}" --region "$AWS_REGION" --query "SecurityGroups[0].GroupId" --output text 2>/dev/null || echo "None")

if [ "$EC2_SG_ID" == "None" ] || [ -z "$EC2_SG_ID" ]; then
  EC2_SG_ID=$(aws ec2 create-security-group \
    --group-name "cloudbank-ec2-sg" \
    --description "Security group for CloudBank web and API EC2 instance" \
    --vpc-id "$VPC_ID" \
    --region "$AWS_REGION" \
    --output text --query "GroupId")
  echo "✅ Created EC2 Security Group: ${EC2_SG_ID}"

  # Open HTTP port 80 to world
  aws ec2 authorize-security-group-ingress \
    --group-id "$EC2_SG_ID" \
    --protocol tcp --port 80 --cidr 0.0.0.0/0 \
    --region "$AWS_REGION"

  # Open SSH port 22 to current caller IP
  MY_IP=$(curl -s https://checkip.amazonaws.com || curl -s https://ifconfig.me)
  aws ec2 authorize-security-group-ingress \
    --group-id "$EC2_SG_ID" \
    --protocol tcp --port 22 --cidr "${MY_IP}/32" \
    --region "$AWS_REGION"
  echo "✅ Inbound rules added (Port 80: public, Port 22: ${MY_IP}/32)"
else
  echo "ℹ️ Existing EC2 Security Group found: ${EC2_SG_ID}"
fi

# ------------------------------------------------------------------------------
# 4. Create RDS Security Group (cloudbank-rds-sg)
# ------------------------------------------------------------------------------
echo "🔒 Configuring RDS Security Group (Defense-in-Depth)..."
RDS_SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=cloudbank-rds-sg" "Name=vpc-id,Values=${VPC_ID}" --region "$AWS_REGION" --query "SecurityGroups[0].GroupId" --output text 2>/dev/null || echo "None")

if [ "$RDS_SG_ID" == "None" ] || [ -z "$RDS_SG_ID" ]; then
  RDS_SG_ID=$(aws ec2 create-security-group \
    --group-name "cloudbank-rds-sg" \
    --description "Private security group for CloudBank RDS PostgreSQL database" \
    --vpc-id "$VPC_ID" \
    --region "$AWS_REGION" \
    --output text --query "GroupId")
  echo "✅ Created RDS Security Group: ${RDS_SG_ID}"

  # Allow port 5432 ONLY from EC2 Security Group
  aws ec2 authorize-security-group-ingress \
    --group-id "$RDS_SG_ID" \
    --protocol tcp --port 5432 --source-group "$EC2_SG_ID" \
    --region "$AWS_REGION"
  echo "✅ PostgreSQL port 5432 locked strictly to source SG: ${EC2_SG_ID}"
else
  echo "ℹ️ Existing RDS Security Group found: ${RDS_SG_ID}"
fi

# ------------------------------------------------------------------------------
# 5. Provision Amazon RDS PostgreSQL Instance
# ------------------------------------------------------------------------------
echo "🐘 Checking Amazon RDS PostgreSQL instance..."
RDS_STATUS=$(aws rds describe-db-instances --db-instance-identifier "cloudbank-db" --region "$AWS_REGION" --query "DBInstances[0].DBInstanceStatus" --output text 2>/dev/null || echo "not_found")

if [ "$RDS_STATUS" == "not_found" ]; then
  # Ensure DB Subnet Group exists across default VPC subnets
  DB_SUBNET_GROUP="cloudbank-db-subnet-group"
  SUBNET_GROUP_EXISTS=$(aws rds describe-db-subnet-groups --db-subnet-group-name "$DB_SUBNET_GROUP" --region "$AWS_REGION" --query "DBSubnetGroups[0].DBSubnetGroupName" --output text 2>/dev/null || echo "None")
  if [ "$SUBNET_GROUP_EXISTS" == "None" ] || [ -z "$SUBNET_GROUP_EXISTS" ]; then
    SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=${VPC_ID}" --region "$AWS_REGION" --query "Subnets[*].SubnetId" --output text)
    aws rds create-db-subnet-group \
      --db-subnet-group-name "$DB_SUBNET_GROUP" \
      --db-subnet-group-description "CloudBank DB Subnet Group" \
      --subnet-ids $SUBNET_IDS \
      --region "$AWS_REGION" > /dev/null
    echo "✅ Created DB Subnet Group: ${DB_SUBNET_GROUP}"
  fi

  echo "⏳ Launching Amazon RDS PostgreSQL (db.t3.micro, 20 GB gp3)..."
  aws rds create-db-instance \
    --db-instance-identifier "cloudbank-db" \
    --db-instance-class "$RDS_INSTANCE_CLASS" \
    --engine postgres \
    --engine-version "16.15" \
    --allocated-storage 20 \
    --storage-type gp3 \
    --master-username "$RDS_MASTER_USER" \
    --master-user-password "$RDS_MASTER_PASS" \
    --db-name "$RDS_DB_NAME" \
    --db-subnet-group-name "$DB_SUBNET_GROUP" \
    --vpc-security-group-ids "$RDS_SG_ID" \
    --no-publicly-accessible \
    --backup-retention-period 0 \
    --no-auto-minor-version-upgrade \
    --region "$AWS_REGION" > /dev/null
  echo "✅ RDS creation initiated. (Provisioning takes ~5-8 minutes in background)."
else
  echo "ℹ️ RDS instance exists with status: ${RDS_STATUS}"
fi

# ------------------------------------------------------------------------------
# 6. Create SSH Key Pair
# ------------------------------------------------------------------------------
echo "🔑 Checking SSH Key Pair..."
if [ ! -f "$KEY_FILE" ]; then
  aws ec2 delete-key-pair --key-name "$KEY_NAME" --region "$AWS_REGION" 2>/dev/null || true
  aws ec2 create-key-pair --key-name "$KEY_NAME" --query "KeyMaterial" --output text --region "$AWS_REGION" > "$KEY_FILE"
  chmod 400 "$KEY_FILE"
  echo "✅ Created and saved SSH key to: ${KEY_FILE}"
else
  echo "ℹ️ SSH key already present: ${KEY_FILE}"
fi

# ------------------------------------------------------------------------------
# 7. Launch Amazon EC2 Instance
# ------------------------------------------------------------------------------
echo "💻 Checking EC2 Instance..."
INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=cloudbank-server" "Name=instance-state-name,Values=running,pending" \
  --region "$AWS_REGION" \
  --query "Reservations[0].Instances[0].InstanceId" --output text 2>/dev/null || echo "None")

if [ "$INSTANCE_ID" == "None" ] || [ -z "$INSTANCE_ID" ]; then
  echo "🔍 Finding latest Ubuntu 22.04 LTS AMI..."
  UBUNTU_AMI=$(aws ec2 describe-images \
    --owners 099720109477 \
    --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
    --query "sort_by(Images, &CreationDate)[-1].ImageId" \
    --region "$AWS_REGION" --output text)
  echo "✅ Selected Ubuntu AMI: ${UBUNTU_AMI}"

  echo "⏳ Launching EC2 instance (${EC2_INSTANCE_TYPE})..."
  INSTANCE_ID=$(aws ec2 run-instances \
    --image-id "$UBUNTU_AMI" \
    --instance-type "$EC2_INSTANCE_TYPE" \
    --key-name "$KEY_NAME" \
    --security-group-ids "$EC2_SG_ID" \
    --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":8,"VolumeType":"gp3"}}]' \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=cloudbank-server}]' \
    --region "$AWS_REGION" \
    --query "Instances[0].InstanceId" --output text)
  echo "✅ EC2 Instance Launched: ${INSTANCE_ID}"
else
  echo "ℹ️ Existing EC2 Instance found: ${INSTANCE_ID}"
fi

# Wait for EC2 to enter running state
echo "⏳ Waiting for EC2 instance to be running..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$AWS_REGION"
EC2_PUBLIC_IP=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --region "$AWS_REGION" --query "Reservations[0].Instances[0].PublicIpAddress" --output text)
echo "✅ EC2 is Running! Public IP: ${EC2_PUBLIC_IP}"

# ------------------------------------------------------------------------------
# 8. Wait for RDS Instance to be Available
# ------------------------------------------------------------------------------
echo "⏳ Waiting for Amazon RDS PostgreSQL to become available (this may take a few minutes)..."
aws rds wait db-instance-available --db-instance-identifier "cloudbank-db" --region "$AWS_REGION"
RDS_ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier "cloudbank-db" --region "$AWS_REGION" --query "DBInstances[0].Endpoint.Address" --output text)
echo "✅ RDS is Available! Endpoint: ${RDS_ENDPOINT}"

# ------------------------------------------------------------------------------
# 9. Configure EC2 & Deploy CloudBank Containers
# ------------------------------------------------------------------------------
echo "⏳ Waiting for SSH to become ready on EC2..."
until ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i "$KEY_FILE" ubuntu@"$EC2_PUBLIC_IP" "echo ready" &>/dev/null; do
  sleep 5
done
echo "✅ SSH is ready!"

echo "📦 Installing Docker and Docker Compose on EC2..."
ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" ubuntu@"$EC2_PUBLIC_IP" << 'EOF'
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-v2
sudo usermod -aG docker ubuntu
mkdir -p /home/ubuntu/cloudbank
EOF

echo "📤 Syncing project files to EC2..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
rsync -avz -e "ssh -o StrictHostKeyChecking=no -i ${KEY_FILE}" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  "${SCRIPT_DIR}/" ubuntu@"${EC2_PUBLIC_IP}":/home/ubuntu/cloudbank/

echo "🐘 Initializing RDS Schema & Seed from EC2..."
ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" ubuntu@"$EC2_PUBLIC_IP" << EOF
cd /home/ubuntu/cloudbank
sudo docker run --rm -v \$(pwd)/database:/db postgres:16-alpine \
  psql "postgres://${RDS_MASTER_USER}:${RDS_MASTER_PASS}@${RDS_ENDPOINT}:5432/${RDS_DB_NAME}" -f /db/init.sql

sudo docker run --rm -v \$(pwd)/database:/db postgres:16-alpine \
  psql "postgres://${RDS_MASTER_USER}:${RDS_MASTER_PASS}@${RDS_ENDPOINT}:5432/${RDS_DB_NAME}" -f /db/seed.sql
EOF

echo "🚀 Starting CloudBank Containers on EC2 (Nginx + Express -> Amazon RDS)..."
ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" ubuntu@"$EC2_PUBLIC_IP" << EOF
cd /home/ubuntu/cloudbank
cat << ENVFILE > .env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgres://${RDS_MASTER_USER}:${RDS_MASTER_PASS}@${RDS_ENDPOINT}:5432/${RDS_DB_NAME}
SUSPICIOUS_THRESHOLD_PAISE=5000000
ENVFILE

sudo docker compose -f docker-compose.aws.yml down 2>/dev/null || true
sudo docker compose -f docker-compose.aws.yml up -d --build
EOF

# ------------------------------------------------------------------------------
# 10. Smoke Test Live Cloud Deployment
# ------------------------------------------------------------------------------
echo "⏳ Verifying live deployment on http://${EC2_PUBLIC_IP}/api/health..."
sleep 8
HEALTH_RESULT=$(curl -s "http://${EC2_PUBLIC_IP}/api/health" || echo "failed")

echo "===================================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "===================================================================="
echo "Public Web Dashboard: http://${EC2_PUBLIC_IP}"
echo "Health Check:         http://${EC2_PUBLIC_IP}/api/health"
echo "Health Response:      ${HEALTH_RESULT}"
echo "Amazon RDS Endpoint:  ${RDS_ENDPOINT}"
echo "SSH Access:           ssh -i ${KEY_FILE} ubuntu@${EC2_PUBLIC_IP}"
echo "===================================================================="
