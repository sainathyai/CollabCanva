#!/bin/bash

# Complete AWS ECS Deployment Script
# This script creates all AWS resources needed for CollabCanvas backend

set -e

echo "🚀 CollabCanvas ECS Complete Deployment"
echo "========================================"
echo ""

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
PROJECT_NAME="collabcanvas"
CLUSTER_NAME="${PROJECT_NAME}-cluster"
SERVICE_NAME="${PROJECT_NAME}-backend-service"
TASK_FAMILY="${PROJECT_NAME}-backend-task"
ECR_REPO_NAME="${PROJECT_NAME}-backend"
ALB_NAME="${PROJECT_NAME}-alb"
TARGET_GROUP_NAME="${PROJECT_NAME}-tg"
LOG_GROUP_NAME="/ecs/${PROJECT_NAME}-backend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Region: $AWS_REGION"
echo "   Project: $PROJECT_NAME"
echo "   Cluster: $CLUSTER_NAME"
echo ""

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: $AWS_ACCOUNT_ID${NC}"
echo ""

# ==========================================
# Step 1: Create VPC and Networking
# ==========================================
echo -e "${BLUE}🌐 Step 1: Setting up VPC and Networking${NC}"
echo "=========================================="

# Get default VPC
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text --region $AWS_REGION)

if [[ "$VPC_ID" == "None" ]] || [[ -z "$VPC_ID" ]]; then
    echo "⚠️  No default VPC found. Creating new VPC..."
    VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --region $AWS_REGION --query 'Vpc.VpcId' --output text)
    aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=${PROJECT_NAME}-vpc --region $AWS_REGION
    echo "✅ Created VPC: $VPC_ID"
else
    echo "✅ Using default VPC: $VPC_ID"
fi

# Get subnets
SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[*].SubnetId" --output text --region $AWS_REGION)
SUBNET_ARRAY=($SUBNET_IDS)
echo "✅ Found ${#SUBNET_ARRAY[@]} subnets: ${SUBNET_ARRAY[*]}"

# Create security group for ALB
echo ""
echo "🔒 Creating security group for ALB..."
ALB_SG_ID=$(aws ec2 create-security-group \
    --group-name ${PROJECT_NAME}-alb-sg \
    --description "Security group for ${PROJECT_NAME} ALB" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query 'GroupId' \
    --output text 2>/dev/null || aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=${PROJECT_NAME}-alb-sg" \
    --query "SecurityGroups[0].GroupId" \
    --output text \
    --region $AWS_REGION)

echo "✅ ALB Security Group: $ALB_SG_ID"

# Add inbound rules to ALB security group
aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION 2>/dev/null || echo "   (HTTP rule already exists)"

aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION 2>/dev/null || echo "   (HTTPS rule already exists)"

# Create security group for ECS tasks
echo ""
echo "🔒 Creating security group for ECS tasks..."
ECS_SG_ID=$(aws ec2 create-security-group \
    --group-name ${PROJECT_NAME}-ecs-sg \
    --description "Security group for ${PROJECT_NAME} ECS tasks" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query 'GroupId' \
    --output text 2>/dev/null || aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=${PROJECT_NAME}-ecs-sg" \
    --query "SecurityGroups[0].GroupId" \
    --output text \
    --region $AWS_REGION)

echo "✅ ECS Security Group: $ECS_SG_ID"

# Allow traffic from ALB to ECS tasks
aws ec2 authorize-security-group-ingress \
    --group-id $ECS_SG_ID \
    --protocol tcp \
    --port 8080 \
    --source-group $ALB_SG_ID \
    --region $AWS_REGION 2>/dev/null || echo "   (ALB->ECS rule already exists)"

echo ""

# ==========================================
# Step 2: Create ECR Repository
# ==========================================
echo -e "${BLUE}📦 Step 2: Creating ECR Repository${NC}"
echo "===================================="

aws ecr create-repository \
    --repository-name $ECR_REPO_NAME \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 2>/dev/null || echo "✅ ECR repository already exists"

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"
echo "✅ ECR Repository: $ECR_URI"
echo ""

# ==========================================
# Step 3: Create CloudWatch Log Group
# ==========================================
echo -e "${BLUE}📊 Step 3: Creating CloudWatch Log Group${NC}"
echo "=========================================="

aws logs create-log-group \
    --log-group-name $LOG_GROUP_NAME \
    --region $AWS_REGION 2>/dev/null || echo "✅ Log group already exists"

echo "✅ Log Group: $LOG_GROUP_NAME"
echo ""

# ==========================================
# Step 4: Create IAM Roles
# ==========================================
echo -e "${BLUE}🔑 Step 4: Creating IAM Roles${NC}"
echo "=============================="

# Task Execution Role
EXECUTION_ROLE_NAME="${PROJECT_NAME}-task-execution-role"
echo "Creating Task Execution Role..."

cat > /tmp/task-execution-assume-role-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
    --role-name $EXECUTION_ROLE_NAME \
    --assume-role-policy-document file:///tmp/task-execution-assume-role-policy.json \
    --region $AWS_REGION 2>/dev/null || echo "   (Role already exists)"

aws iam attach-role-policy \
    --role-name $EXECUTION_ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
    --region $AWS_REGION 2>/dev/null || echo "   (Policy already attached)"

# Add SSM permissions
cat > /tmp/task-execution-ssm-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameters",
        "ssm:GetParameter",
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "*"
    }
  ]
}
EOF

aws iam put-role-policy \
    --role-name $EXECUTION_ROLE_NAME \
    --policy-name SSMAccess \
    --policy-document file:///tmp/task-execution-ssm-policy.json \
    --region $AWS_REGION 2>/dev/null || echo "   (SSM policy already attached)"

EXECUTION_ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/${EXECUTION_ROLE_NAME}"
echo "✅ Task Execution Role: $EXECUTION_ROLE_ARN"

# Task Role (for application)
TASK_ROLE_NAME="${PROJECT_NAME}-task-role"
echo "Creating Task Role..."

aws iam create-role \
    --role-name $TASK_ROLE_NAME \
    --assume-role-policy-document file:///tmp/task-execution-assume-role-policy.json \
    --region $AWS_REGION 2>/dev/null || echo "   (Role already exists)"

# Add DynamoDB permissions
cat > /tmp/task-dynamodb-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:${AWS_REGION}:${AWS_ACCOUNT_ID}:table/${PROJECT_NAME}-*"
      ]
    }
  ]
}
EOF

aws iam put-role-policy \
    --role-name $TASK_ROLE_NAME \
    --policy-name DynamoDBAccess \
    --policy-document file:///tmp/task-dynamodb-policy.json \
    --region $AWS_REGION 2>/dev/null || echo "   (DynamoDB policy already attached)"

TASK_ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/${TASK_ROLE_NAME}"
echo "✅ Task Role: $TASK_ROLE_ARN"
echo ""

# Wait for IAM roles to propagate
echo "⏳ Waiting for IAM roles to propagate (10 seconds)..."
sleep 10

# ==========================================
# Step 5: Create Application Load Balancer
# ==========================================
echo -e "${BLUE}⚖️  Step 5: Creating Application Load Balancer${NC}"
echo "=============================================="

ALB_ARN=$(aws elbv2 create-load-balancer \
    --name $ALB_NAME \
    --subnets ${SUBNET_ARRAY[@]} \
    --security-groups $ALB_SG_ID \
    --scheme internet-facing \
    --type application \
    --ip-address-type ipv4 \
    --region $AWS_REGION \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text 2>/dev/null || aws elbv2 describe-load-balancers \
    --names $ALB_NAME \
    --region $AWS_REGION \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text)

echo "✅ ALB ARN: $ALB_ARN"

# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
    --load-balancer-arns $ALB_ARN \
    --region $AWS_REGION \
    --query 'LoadBalancers[0].DNSName' \
    --output text)

echo "✅ ALB DNS: $ALB_DNS"

# Create Target Group
echo ""
echo "🎯 Creating Target Group..."
TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
    --name $TARGET_GROUP_NAME \
    --protocol HTTP \
    --port 8080 \
    --vpc-id $VPC_ID \
    --target-type ip \
    --health-check-path /health \
    --health-check-interval-seconds 30 \
    --health-check-timeout-seconds 5 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 3 \
    --region $AWS_REGION \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text 2>/dev/null || aws elbv2 describe-target-groups \
    --names $TARGET_GROUP_NAME \
    --region $AWS_REGION \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text)

echo "✅ Target Group: $TARGET_GROUP_ARN"

# Create HTTP Listener
echo ""
echo "🔊 Creating HTTP Listener..."
aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=$TARGET_GROUP_ARN \
    --region $AWS_REGION 2>/dev/null || echo "✅ HTTP Listener already exists"

echo ""

# ==========================================
# Step 6: Create ECS Cluster
# ==========================================
echo -e "${BLUE}🐳 Step 6: Creating ECS Cluster${NC}"
echo "================================"

aws ecs create-cluster \
    --cluster-name $CLUSTER_NAME \
    --region $AWS_REGION \
    --capacity-providers FARGATE FARGATE_SPOT \
    --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 2>/dev/null || echo "✅ ECS cluster already exists"

echo "✅ ECS Cluster: $CLUSTER_NAME"
echo ""

# ==========================================
# Step 7: Store Environment Variables in SSM
# ==========================================
echo -e "${BLUE}🔐 Step 7: Storing Environment Variables${NC}"
echo "=========================================="

PARAM_PREFIX="/collabcanvas/prod"

# Function to store parameter
store_param() {
    local name=$1
    local value=$2
    local type=${3:-String}

    aws ssm put-parameter \
        --name "$PARAM_PREFIX/$name" \
        --value "$value" \
        --type "$type" \
        --overwrite \
        --region $AWS_REGION &> /dev/null
    echo "✅ Stored: $name"
}

# Store non-sensitive config
store_param "node-env" "production"
store_param "port" "8080"
store_param "aws-region" "$AWS_REGION"
store_param "dynamodb-table-prefix" "collabcanvas"
store_param "allowed-origins" "http://localhost:5173,https://*.amplifyapp.com"

echo ""
echo -e "${YELLOW}⚠️  You need to manually store sensitive values:${NC}"
echo ""
echo "Run these commands with your actual values:"
echo ""
echo "# Firebase credentials"
echo "aws ssm put-parameter --name '$PARAM_PREFIX/firebase-project-id' --value 'YOUR_PROJECT_ID' --type String --region $AWS_REGION"
echo "aws ssm put-parameter --name '$PARAM_PREFIX/firebase-client-email' --value 'YOUR_CLIENT_EMAIL' --type SecureString --region $AWS_REGION"
echo "aws ssm put-parameter --name '$PARAM_PREFIX/firebase-private-key' --value 'YOUR_PRIVATE_KEY' --type SecureString --region $AWS_REGION"
echo ""
echo "# AWS credentials (if needed for DynamoDB from ECS)"
echo "aws ssm put-parameter --name '$PARAM_PREFIX/aws-access-key-id' --value 'YOUR_KEY' --type SecureString --region $AWS_REGION"
echo "aws ssm put-parameter --name '$PARAM_PREFIX/aws-secret-access-key' --value 'YOUR_SECRET' --type SecureString --region $AWS_REGION"
echo ""

# ==========================================
# Step 8: Build and Push Docker Image
# ==========================================
echo -e "${BLUE}🐳 Step 8: Building and Pushing Docker Image${NC}"
echo "=============================================="

read -p "Do you want to build and push the Docker image now? (y/n): " build_choice

if [[ $build_choice == "y" ]]; then
    cd backend

    echo "📦 Building Docker image..."
    docker build -t ${PROJECT_NAME}-backend:latest .

    echo "🔐 Logging in to ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI

    echo "🏷️  Tagging image..."
    docker tag ${PROJECT_NAME}-backend:latest $ECR_URI:latest

    echo "🚢 Pushing to ECR..."
    docker push $ECR_URI:latest

    echo "✅ Image pushed to ECR"
    cd ..
else
    echo "⏭️  Skipped Docker build"
fi

echo ""

# ==========================================
# Step 9: Create Task Definition
# ==========================================
echo -e "${BLUE}📋 Step 9: Creating ECS Task Definition${NC}"
echo "========================================"

cat > /tmp/task-definition.json <<EOF
{
  "family": "$TASK_FAMILY",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "$EXECUTION_ROLE_ARN",
  "taskRoleArn": "$TASK_ROLE_ARN",
  "containerDefinitions": [
    {
      "name": "${PROJECT_NAME}-backend",
      "image": "$ECR_URI:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "secrets": [
        {
          "name": "FIREBASE_PROJECT_ID",
          "valueFrom": "$PARAM_PREFIX/firebase-project-id"
        },
        {
          "name": "FIREBASE_CLIENT_EMAIL",
          "valueFrom": "$PARAM_PREFIX/firebase-client-email"
        },
        {
          "name": "FIREBASE_PRIVATE_KEY",
          "valueFrom": "$PARAM_PREFIX/firebase-private-key"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "8080"
        },
        {
          "name": "AWS_REGION",
          "value": "$AWS_REGION"
        },
        {
          "name": "DYNAMODB_TABLE_PREFIX",
          "value": "collabcanvas"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "$LOG_GROUP_NAME",
          "awslogs-region": "$AWS_REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
EOF

aws ecs register-task-definition \
    --cli-input-json file:///tmp/task-definition.json \
    --region $AWS_REGION > /dev/null

echo "✅ Task Definition registered: $TASK_FAMILY"
echo ""

# ==========================================
# Step 10: Create ECS Service
# ==========================================
echo -e "${BLUE}🚀 Step 10: Creating ECS Service${NC}"
echo "================================="

read -p "Do you want to create the ECS service now? (Requires SSM secrets to be populated) (y/n): " service_choice

if [[ $service_choice == "y" ]]; then
    aws ecs create-service \
        --cluster $CLUSTER_NAME \
        --service-name $SERVICE_NAME \
        --task-definition $TASK_FAMILY \
        --desired-count 2 \
        --launch-type FARGATE \
        --platform-version LATEST \
        --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_ARRAY[0]},${SUBNET_ARRAY[1]}],securityGroups=[$ECS_SG_ID],assignPublicIp=ENABLED}" \
        --load-balancers "targetGroupArn=$TARGET_GROUP_ARN,containerName=${PROJECT_NAME}-backend,containerPort=8080" \
        --health-check-grace-period-seconds 60 \
        --region $AWS_REGION 2>/dev/null || echo "✅ Service already exists"

    echo "✅ ECS Service created: $SERVICE_NAME"
else
    echo "⏭️  Skipped service creation"
    echo ""
    echo "To create the service manually after populating SSM secrets:"
    echo ""
    echo "aws ecs create-service \\"
    echo "  --cluster $CLUSTER_NAME \\"
    echo "  --service-name $SERVICE_NAME \\"
    echo "  --task-definition $TASK_FAMILY \\"
    echo "  --desired-count 2 \\"
    echo "  --launch-type FARGATE \\"
    echo "  --network-configuration \"awsvpcConfiguration={subnets=[${SUBNET_ARRAY[0]},${SUBNET_ARRAY[1]}],securityGroups=[$ECS_SG_ID],assignPublicIp=ENABLED}\" \\"
    echo "  --load-balancers \"targetGroupArn=$TARGET_GROUP_ARN,containerName=${PROJECT_NAME}-backend,containerPort=8080\" \\"
    echo "  --health-check-grace-period-seconds 60 \\"
    echo "  --region $AWS_REGION"
fi

echo ""

# ==========================================
# Summary
# ==========================================
echo "=============================================="
echo -e "${GREEN}🎉 AWS ECS Infrastructure Deployment Complete!${NC}"
echo "=============================================="
echo ""
echo "📋 Summary:"
echo "   VPC ID: $VPC_ID"
echo "   ALB DNS: $ALB_DNS"
echo "   ECR URI: $ECR_URI"
echo "   ECS Cluster: $CLUSTER_NAME"
echo "   ECS Service: $SERVICE_NAME"
echo ""
echo "🌐 Your backend will be available at:"
echo "   HTTP: http://$ALB_DNS"
echo "   WebSocket: ws://$ALB_DNS"
echo ""
echo "📝 Next Steps:"
echo "   1. Populate SSM secrets (see commands above)"
echo "   2. If you skipped service creation, run the create-service command"
echo "   3. Update frontend VITE_WS_URL to: ws://$ALB_DNS"
echo "   4. Deploy frontend to Amplify"
echo "   5. Monitor service: aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION"
echo ""
echo "📊 Monitor your deployment:"
echo "   CloudWatch Logs: $LOG_GROUP_NAME"
echo "   ECS Console: https://console.aws.amazon.com/ecs/home?region=$AWS_REGION#/clusters/$CLUSTER_NAME/services"
echo ""
echo "💰 Estimated monthly cost: ~\$50"
echo ""

# Cleanup temp files
rm -f /tmp/task-*.json

