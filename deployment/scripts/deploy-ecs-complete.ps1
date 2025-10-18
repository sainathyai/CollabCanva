# Complete AWS ECS Deployment Script for Windows PowerShell
# This script creates all AWS resources needed for CollabCanvas backend

$ErrorActionPreference = "Stop"

Write-Host "🚀 CollabCanvas ECS Complete Deployment" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Configuration
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }
$PROJECT_NAME = "collabcanvas"
$CLUSTER_NAME = "$PROJECT_NAME-cluster"
$SERVICE_NAME = "$PROJECT_NAME-backend-service"
$TASK_FAMILY = "$PROJECT_NAME-backend-task"
$ECR_REPO_NAME = "$PROJECT_NAME-backend"
$ALB_NAME = "$PROJECT_NAME-alb"
$TARGET_GROUP_NAME = "$PROJECT_NAME-tg"
$LOG_GROUP_NAME = "/ecs/$PROJECT_NAME-backend"

Write-Host "📋 Configuration:" -ForegroundColor Cyan
Write-Host "   Region: $AWS_REGION"
Write-Host "   Project: $PROJECT_NAME"
Write-Host "   Cluster: $CLUSTER_NAME"
Write-Host ""

# Get AWS Account ID
Write-Host "🔍 Getting AWS Account ID..." -ForegroundColor Yellow
$AWS_ACCOUNT_ID = aws sts get-caller-identity --query Account --output text

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AWS CLI not configured. Run 'aws configure' first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ AWS Account: $AWS_ACCOUNT_ID" -ForegroundColor Green
Write-Host ""

# ==========================================
# Step 1: Create VPC and Networking
# ==========================================
Write-Host "🌐 Step 1: Setting up VPC and Networking" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue

# Get default VPC
$VPC_ID = aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text --region $AWS_REGION

if ([string]::IsNullOrEmpty($VPC_ID) -or $VPC_ID -eq "None") {
    Write-Host "⚠️  No default VPC found. Using first available VPC..." -ForegroundColor Yellow
    $VPC_ID = aws ec2 describe-vpcs --query "Vpcs[0].VpcId" --output text --region $AWS_REGION
}

Write-Host "✅ Using VPC: $VPC_ID" -ForegroundColor Green

# Get subnets
$SUBNET_IDS = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[*].SubnetId" --output text --region $AWS_REGION
$SUBNET_ARRAY = $SUBNET_IDS -split '\s+'
Write-Host "✅ Found $($SUBNET_ARRAY.Count) subnets" -ForegroundColor Green

# Create security group for ALB
Write-Host ""
Write-Host "🔒 Creating security group for ALB..." -ForegroundColor Yellow
try {
    $ALB_SG_ID = aws ec2 create-security-group `
        --group-name "$PROJECT_NAME-alb-sg" `
        --description "Security group for $PROJECT_NAME ALB" `
        --vpc-id $VPC_ID `
        --region $AWS_REGION `
        --query 'GroupId' `
        --output text
    Write-Host "✅ Created ALB Security Group: $ALB_SG_ID" -ForegroundColor Green
} catch {
    $ALB_SG_ID = aws ec2 describe-security-groups `
        --filters "Name=group-name,Values=$PROJECT_NAME-alb-sg" `
        --query "SecurityGroups[0].GroupId" `
        --output text `
        --region $AWS_REGION
    Write-Host "✅ Using existing ALB Security Group: $ALB_SG_ID" -ForegroundColor Green
}

# Add inbound rules to ALB security group
aws ec2 authorize-security-group-ingress `
    --group-id $ALB_SG_ID `
    --protocol tcp `
    --port 80 `
    --cidr 0.0.0.0/0 `
    --region $AWS_REGION 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "   Added HTTP rule" } else { Write-Host "   (HTTP rule already exists)" }

aws ec2 authorize-security-group-ingress `
    --group-id $ALB_SG_ID `
    --protocol tcp `
    --port 443 `
    --cidr 0.0.0.0/0 `
    --region $AWS_REGION 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "   Added HTTPS rule" } else { Write-Host "   (HTTPS rule already exists)" }

# Create security group for ECS tasks
Write-Host ""
Write-Host "🔒 Creating security group for ECS tasks..." -ForegroundColor Yellow
try {
    $ECS_SG_ID = aws ec2 create-security-group `
        --group-name "$PROJECT_NAME-ecs-sg" `
        --description "Security group for $PROJECT_NAME ECS tasks" `
        --vpc-id $VPC_ID `
        --region $AWS_REGION `
        --query 'GroupId' `
        --output text
    Write-Host "✅ Created ECS Security Group: $ECS_SG_ID" -ForegroundColor Green
} catch {
    $ECS_SG_ID = aws ec2 describe-security-groups `
        --filters "Name=group-name,Values=$PROJECT_NAME-ecs-sg" `
        --query "SecurityGroups[0].GroupId" `
        --output text `
        --region $AWS_REGION
    Write-Host "✅ Using existing ECS Security Group: $ECS_SG_ID" -ForegroundColor Green
}

# Allow traffic from ALB to ECS tasks
aws ec2 authorize-security-group-ingress `
    --group-id $ECS_SG_ID `
    --protocol tcp `
    --port 8080 `
    --source-group $ALB_SG_ID `
    --region $AWS_REGION 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host '   Added ALB to ECS rule' } else { Write-Host '   (ALB to ECS rule already exists)' }

Write-Host ""

# ==========================================
# Step 2: Create ECR Repository
# ==========================================
Write-Host "📦 Step 2: Creating ECR Repository" -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue

aws ecr create-repository `
    --repository-name $ECR_REPO_NAME `
    --region $AWS_REGION `
    --image-scanning-configuration scanOnPush=true `
    --encryption-configuration encryptionType=AES256 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Created ECR repository" -ForegroundColor Green
} else {
    Write-Host "✅ ECR repository already exists" -ForegroundColor Green
}

$ECR_URI = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"
Write-Host "✅ ECR Repository: $ECR_URI" -ForegroundColor Green
Write-Host ""

# ==========================================
# Step 3: Create CloudWatch Log Group
# ==========================================
Write-Host "📊 Step 3: Creating CloudWatch Log Group" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue

aws logs create-log-group `
    --log-group-name $LOG_GROUP_NAME `
    --region $AWS_REGION 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Created log group" -ForegroundColor Green
} else {
    Write-Host "✅ Log group already exists" -ForegroundColor Green
}

Write-Host "✅ Log Group: $LOG_GROUP_NAME" -ForegroundColor Green
Write-Host ""

# ==========================================
# Step 4: Create IAM Roles
# ==========================================
Write-Host "🔑 Step 4: Creating IAM Roles" -ForegroundColor Blue
Write-Host "==============================" -ForegroundColor Blue

# Task Execution Role
$EXECUTION_ROLE_NAME = "$PROJECT_NAME-task-execution-role"
Write-Host "Creating Task Execution Role..." -ForegroundColor Yellow

$assumeRolePolicy = @'
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
'@

$assumeRolePolicy | Out-File -FilePath "$env:TEMP\assume-role-policy.json" -Encoding utf8

aws iam create-role `
    --role-name $EXECUTION_ROLE_NAME `
    --assume-role-policy-document file://$env:TEMP\assume-role-policy.json 2>$null

aws iam attach-role-policy `
    --role-name $EXECUTION_ROLE_NAME `
    --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy" 2>$null

# Add SSM permissions
$ssmPolicy = @'
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
'@

$ssmPolicy | Out-File -FilePath "$env:TEMP\ssm-policy.json" -Encoding utf8

aws iam put-role-policy `
    --role-name $EXECUTION_ROLE_NAME `
    --policy-name SSMAccess `
    --policy-document file://$env:TEMP\ssm-policy.json 2>$null

$EXECUTION_ROLE_ARN = "arn:aws:iam::$AWS_ACCOUNT_ID:role/$EXECUTION_ROLE_NAME"
Write-Host "✅ Task Execution Role: $EXECUTION_ROLE_ARN" -ForegroundColor Green

# Task Role (for application)
$TASK_ROLE_NAME = "$PROJECT_NAME-task-role"
Write-Host "Creating Task Role..." -ForegroundColor Yellow

aws iam create-role `
    --role-name $TASK_ROLE_NAME `
    --assume-role-policy-document file://$env:TEMP\assume-role-policy.json 2>$null

# Add DynamoDB permissions
$dynamoPolicy = @"
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
"@

$dynamoPolicy | Out-File -FilePath "$env:TEMP\dynamodb-policy.json" -Encoding utf8

aws iam put-role-policy `
    --role-name $TASK_ROLE_NAME `
    --policy-name DynamoDBAccess `
    --policy-document file://$env:TEMP\dynamodb-policy.json 2>$null

$TASK_ROLE_ARN = "arn:aws:iam::$AWS_ACCOUNT_ID:role/$TASK_ROLE_NAME"
Write-Host "✅ Task Role: $TASK_ROLE_ARN" -ForegroundColor Green
Write-Host ""

# Wait for IAM roles to propagate
Write-Host "⏳ Waiting for IAM roles to propagate (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# ==========================================
# Summary and Next Steps
# ==========================================
Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "🎉 AWS Infrastructure Created Successfully!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resources Created:" -ForegroundColor Cyan
Write-Host "   VPC ID: $VPC_ID"
Write-Host "   ALB Security Group: $ALB_SG_ID"
Write-Host "   ECS Security Group: $ECS_SG_ID"
Write-Host "   ECR Repository: $ECR_URI"
Write-Host "   Log Group: $LOG_GROUP_NAME"
Write-Host "   Execution Role: $EXECUTION_ROLE_ARN"
Write-Host "   Task Role: $TASK_ROLE_ARN"
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Store secrets in AWS Systems Manager:" -ForegroundColor Cyan
Write-Host '   aws ssm put-parameter --name "/collabcanvas/prod/firebase-project-id" --value "YOUR_PROJECT_ID" --type String'
Write-Host '   aws ssm put-parameter --name "/collabcanvas/prod/firebase-client-email" --value "YOUR_EMAIL" --type SecureString'
Write-Host '   aws ssm put-parameter --name "/collabcanvas/prod/firebase-private-key" --value "YOUR_KEY" --type SecureString'
Write-Host ""

Write-Host "2️⃣  Run the continuation script to create ALB, Target Group, ECS Cluster & Service:" -ForegroundColor Cyan
Write-Host "   .\deploy-ecs-part2.ps1"
Write-Host ""

Write-Host "Or continue manually following DEPLOYMENT_CHECKLIST.md" -ForegroundColor Yellow
Write-Host ""

# Save configuration for part 2
$config = @{
    AWS_REGION = $AWS_REGION
    AWS_ACCOUNT_ID = $AWS_ACCOUNT_ID
    VPC_ID = $VPC_ID
    SUBNET_IDS = ($SUBNET_ARRAY -join ',')
    ALB_SG_ID = $ALB_SG_ID
    ECS_SG_ID = $ECS_SG_ID
    ECR_URI = $ECR_URI
    EXECUTION_ROLE_ARN = $EXECUTION_ROLE_ARN
    TASK_ROLE_ARN = $TASK_ROLE_ARN
    LOG_GROUP_NAME = $LOG_GROUP_NAME
    PROJECT_NAME = $PROJECT_NAME
    CLUSTER_NAME = $CLUSTER_NAME
    SERVICE_NAME = $SERVICE_NAME
    TASK_FAMILY = $TASK_FAMILY
    ALB_NAME = $ALB_NAME
    TARGET_GROUP_NAME = $TARGET_GROUP_NAME
}

$config | ConvertTo-Json | Out-File -FilePath ".\aws-deployment-config.json" -Encoding utf8
Write-Host "✅ Configuration saved to aws-deployment-config.json" -ForegroundColor Green

