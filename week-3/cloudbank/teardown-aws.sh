#!/usr/bin/env bash
# ==============================================================================
# CloudBank — AWS Teardown & Cost Cleanup Script
# Group 41 · IT457 Cloud Computing
# Author: Aryan Rathod (202301164)
# ==============================================================================
# Terminates EC2 instance, deletes RDS database, removes security groups.
# ==============================================================================

set -euo pipefail

AWS_REGION="${AWS_REGION:-$(aws configure get region || echo "ap-south-1")}"
AWS_REGION="${AWS_REGION:-ap-south-1}"

echo "===================================================================="
echo "🧹 CloudBank AWS Teardown Initiated (Region: ${AWS_REGION})"
echo "===================================================================="

# 1. Terminate EC2
INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=cloudbank-server" "Name=instance-state-name,Values=running,pending,stopped" \
  --region "$AWS_REGION" \
  --query "Reservations[0].Instances[0].InstanceId" --output text 2>/dev/null || echo "None")

if [ "$INSTANCE_ID" != "None" ] && [ -n "$INSTANCE_ID" ]; then
  echo "🗑️ Terminating EC2 instance: ${INSTANCE_ID}..."
  aws ec2 terminate-instances --instance-ids "$INSTANCE_ID" --region "$AWS_REGION" > /dev/null
  echo "⏳ Waiting for EC2 termination..."
  aws ec2 wait instance-terminated --instance-ids "$INSTANCE_ID" --region "$AWS_REGION"
  echo "✅ EC2 Terminated."
else
  echo "ℹ️ No running/stopped EC2 instance found."
fi

# 2. Delete RDS
RDS_EXISTS=$(aws rds describe-db-instances --db-instance-identifier "cloudbank-db" --region "$AWS_REGION" --query "DBInstances[0].DBInstanceIdentifier" --output text 2>/dev/null || echo "None")

if [ "$RDS_EXISTS" != "None" ] && [ -n "$RDS_EXISTS" ]; then
  echo "🗑️ Deleting Amazon RDS instance (skipping final snapshot)..."
  aws rds delete-db-instance \
    --db-instance-identifier "cloudbank-db" \
    --skip-final-snapshot \
    --delete-automated-backups \
    --region "$AWS_REGION" > /dev/null
  echo "⏳ Waiting for RDS deletion to complete..."
  aws rds wait db-instance-deleted --db-instance-identifier "cloudbank-db" --region "$AWS_REGION"
  echo "✅ RDS Instance Deleted."
else
  echo "ℹ️ No RDS instance found."
fi

# 2.5 Delete DB Subnet Group
DB_SUBNET_GROUP_EXISTS=$(aws rds describe-db-subnet-groups --db-subnet-group-name "cloudbank-db-subnet-group" --region "$AWS_REGION" --query "DBSubnetGroups[0].DBSubnetGroupName" --output text 2>/dev/null || echo "None")
if [ "$DB_SUBNET_GROUP_EXISTS" != "None" ] && [ -n "$DB_SUBNET_GROUP_EXISTS" ]; then
  echo "🗑️ Deleting DB Subnet Group: cloudbank-db-subnet-group..."
  aws rds delete-db-subnet-group --db-subnet-group-name "cloudbank-db-subnet-group" --region "$AWS_REGION" > /dev/null 2>&1 || true
  echo "✅ DB Subnet Group deleted."
fi

# 3. Delete Security Groups
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --region "$AWS_REGION" --query "Vpcs[0].VpcId" --output text 2>/dev/null || echo "None")

RDS_SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=cloudbank-rds-sg" "Name=vpc-id,Values=${VPC_ID}" --region "$AWS_REGION" --query "SecurityGroups[0].GroupId" --output text 2>/dev/null || echo "None")
if [ "$RDS_SG_ID" != "None" ] && [ -n "$RDS_SG_ID" ]; then
  echo "🗑️ Deleting RDS Security Group: ${RDS_SG_ID}..."
  aws ec2 delete-security-group --group-id "$RDS_SG_ID" --region "$AWS_REGION" 2>/dev/null || true
  echo "✅ RDS Security Group deleted."
fi

EC2_SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=cloudbank-ec2-sg" "Name=vpc-id,Values=${VPC_ID}" --region "$AWS_REGION" --query "SecurityGroups[0].GroupId" --output text 2>/dev/null || echo "None")
if [ "$EC2_SG_ID" != "None" ] && [ -n "$EC2_SG_ID" ]; then
  echo "🗑️ Deleting EC2 Security Group: ${EC2_SG_ID}..."
  aws ec2 delete-security-group --group-id "$EC2_SG_ID" --region "$AWS_REGION" 2>/dev/null || true
  echo "✅ EC2 Security Group deleted."
fi

# 4. Clean local SSH key file
if [ -f "cloudbank-key.pem" ]; then
  rm -f "cloudbank-key.pem"
  echo "✅ Removed local cloudbank-key.pem."
fi

echo "===================================================================="
echo "🎉 TEARDOWN COMPLETE! All resources deleted. Zero ongoing charges."
echo "===================================================================="
