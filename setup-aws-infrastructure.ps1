# Simple AWS ECS Infrastructure Setup
# Run step by step to create CollabCanvas backend infrastructure

$ErrorActionPreference = "Continue"
$AWS_REGION = "us-east-2"
$PROJECT_NAME = "collabcanvas"

Write-Host "CollabCanvas AWS Infrastructure Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Get AWS Account ID
Write-Host "Getting AWS Account ID..." -ForegroundColor Yellow
$AWS_ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
Write-Host "AWS Account: $AWS_ACCOUNT_ID" -ForegroundColor Green
Write-Host ""

# Get VPC
Write-Host "Getting VPC..." -ForegroundColor Yellow
$VPC_ID = aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text --region $AWS_REGION
Write-Host "VPC ID: $VPC_ID" -ForegroundColor Green

# Get Subnets
$SUBNET_IDS = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[*].SubnetId" --output text --region $AWS_REGION
$SUBNETS = $SUBNET_IDS -split '\s+'
Write-Host "Subnets: $($SUBNETS -join ', ')" -ForegroundColor Green
Write-Host ""

# Create ALB Security Group
Write-Host "Creating ALB Security Group..." -ForegroundColor Yellow
$ALB_SG_ID = aws ec2 create-security-group --group-name "$PROJECT_NAME-alb-sg" --description "ALB Security Group" --vpc-id $VPC_ID --region $AWS_REGION --query 'GroupId' --output text 2>&1

if ($ALB_SG_ID -like "*already exists*") {
    $ALB_SG_ID = aws ec2 describe-security-groups --filters "Name=group-name,Values=$PROJECT_NAME-alb-sg" --query "SecurityGroups[0].GroupId" --output text --region $AWS_REGION
    Write-Host "Using existing ALB SG: $ALB_SG_ID" -ForegroundColor Green
} else {
    Write-Host "Created ALB SG: $ALB_SG_ID" -ForegroundColor Green
    
    # Add HTTP rule
    aws ec2 authorize-security-group-ingress --group-id $ALB_SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION 2>&1 | Out-Null
    Write-Host "  Added HTTP ingress rule" -ForegroundColor Gray
    
    # Add HTTPS rule
    aws ec2 authorize-security-group-ingress --group-id $ALB_SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $AWS_REGION 2>&1 | Out-Null
    Write-Host "  Added HTTPS ingress rule" -ForegroundColor Gray
}
Write-Host ""

# Create ECS Security Group
Write-Host "Creating ECS Security Group..." -ForegroundColor Yellow
$ECS_SG_ID = aws ec2 create-security-group --group-name "$PROJECT_NAME-ecs-sg" --description "ECS Tasks Security Group" --vpc-id $VPC_ID --region $AWS_REGION --query 'GroupId' --output text 2>&1

if ($ECS_SG_ID -like "*already exists*") {
    $ECS_SG_ID = aws ec2 describe-security-groups --filters "Name=group-name,Values=$PROJECT_NAME-ecs-sg" --query "SecurityGroups[0].GroupId" --output text --region $AWS_REGION
    Write-Host "Using existing ECS SG: $ECS_SG_ID" -ForegroundColor Green
} else {
    Write-Host "Created ECS SG: $ECS_SG_ID" -ForegroundColor Green
    
    # Allow traffic from ALB
    aws ec2 authorize-security-group-ingress --group-id $ECS_SG_ID --protocol tcp --port 8080 --source-group $ALB_SG_ID --region $AWS_REGION 2>&1 | Out-Null
    Write-Host "  Added ALB ingress rule" -ForegroundColor Gray
}
Write-Host ""

# Create ECR Repository
Write-Host "Creating ECR Repository..." -ForegroundColor Yellow
$ECR_RESULT = aws ecr create-repository --repository-name "$PROJECT_NAME-backend" --region $AWS_REGION --image-scanning-configuration scanOnPush=true 2>&1

if ($ECR_RESULT -like "*RepositoryAlreadyExistsException*") {
    Write-Host "ECR repository already exists" -ForegroundColor Green
} else {
    Write-Host "Created ECR repository" -ForegroundColor Green
}

$ECR_URI = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-backend"
Write-Host "ECR URI: $ECR_URI" -ForegroundColor Cyan
Write-Host ""

# Create CloudWatch Log Group
Write-Host "Creating CloudWatch Log Group..." -ForegroundColor Yellow
$LOG_GROUP_NAME = "/ecs/$PROJECT_NAME-backend"
aws logs create-log-group --log-group-name $LOG_GROUP_NAME --region $AWS_REGION 2>&1 | Out-Null
Write-Host "Log Group: $LOG_GROUP_NAME" -ForegroundColor Green
Write-Host ""

# Create IAM Roles
Write-Host "Creating IAM Execution Role..." -ForegroundColor Yellow
$EXECUTION_ROLE_NAME = "$PROJECT_NAME-task-execution-role"

# Create assume role policy
$assumeRolePolicy = @'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ecs-tasks.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
'@
$assumeRolePolicy | Out-File -FilePath "$env:TEMP\assume-role.json" -Encoding utf8

aws iam create-role --role-name $EXECUTION_ROLE_NAME --assume-role-policy-document "file://$env:TEMP\assume-role.json" 2>&1 | Out-Null
aws iam attach-role-policy --role-name $EXECUTION_ROLE_NAME --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy" 2>&1 | Out-Null

# Add SSM policy
$ssmPolicy = @'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["ssm:GetParameters", "ssm:GetParameter", "secretsmanager:GetSecretValue"],
    "Resource": "*"
  }]
}
'@
$ssmPolicy | Out-File -FilePath "$env:TEMP\ssm-policy.json" -Encoding utf8
aws iam put-role-policy --role-name $EXECUTION_ROLE_NAME --policy-name SSMAccess --policy-document "file://$env:TEMP\ssm-policy.json" 2>&1 | Out-Null

$EXECUTION_ROLE_ARN = "arn:aws:iam::${AWS_ACCOUNT_ID}:role/$EXECUTION_ROLE_NAME"
Write-Host "Execution Role: $EXECUTION_ROLE_ARN" -ForegroundColor Green
Write-Host ""

# Create Task Role
Write-Host "Creating IAM Task Role..." -ForegroundColor Yellow
$TASK_ROLE_NAME = "$PROJECT_NAME-task-role"
aws iam create-role --role-name $TASK_ROLE_NAME --assume-role-policy-document "file://$env:TEMP\assume-role.json" 2>&1 | Out-Null

# Add DynamoDB policy
$dynamoPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["dynamodb:*"],
    "Resource": "arn:aws:dynamodb:${AWS_REGION}:${AWS_ACCOUNT_ID}:table/${PROJECT_NAME}-*"
  }]
}
"@
$dynamoPolicy | Out-File -FilePath "$env:TEMP\dynamodb-policy.json" -Encoding utf8
aws iam put-role-policy --role-name $TASK_ROLE_NAME --policy-name DynamoDBAccess --policy-document "file://$env:TEMP\dynamodb-policy.json" 2>&1 | Out-Null

$TASK_ROLE_ARN = "arn:aws:iam::${AWS_ACCOUNT_ID}:role/$TASK_ROLE_NAME"
Write-Host "Task Role: $TASK_ROLE_ARN" -ForegroundColor Green
Write-Host ""

Write-Host "Waiting for IAM roles to propagate (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host ""

# Create ECS Cluster
Write-Host "Creating ECS Cluster..." -ForegroundColor Yellow
aws ecs create-cluster --cluster-name "$PROJECT_NAME-cluster" --region $AWS_REGION 2>&1 | Out-Null
Write-Host "ECS Cluster: $PROJECT_NAME-cluster" -ForegroundColor Green
Write-Host ""

# Save configuration
Write-Host "Saving configuration..." -ForegroundColor Yellow
$config = @{
    AWS_REGION = $AWS_REGION
    AWS_ACCOUNT_ID = $AWS_ACCOUNT_ID
    PROJECT_NAME = $PROJECT_NAME
    VPC_ID = $VPC_ID
    SUBNET_1 = $SUBNETS[0]
    SUBNET_2 = $SUBNETS[1]
    ALB_SG_ID = $ALB_SG_ID
    ECS_SG_ID = $ECS_SG_ID
    ECR_URI = $ECR_URI
    LOG_GROUP_NAME = $LOG_GROUP_NAME
    EXECUTION_ROLE_ARN = $EXECUTION_ROLE_ARN
    TASK_ROLE_ARN = $TASK_ROLE_ARN
}

$config | ConvertTo-Json | Out-File -FilePath "aws-config.json" -Encoding utf8
Write-Host "Configuration saved to aws-config.json" -ForegroundColor Green
Write-Host ""

Write-Host "=====================================" -ForegroundColor Green
Write-Host "Infrastructure Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Build and push Docker image to ECR: $ECR_URI" -ForegroundColor White
Write-Host "2. Store secrets in SSM Parameter Store" -ForegroundColor White
Write-Host "3. Create ALB and Target Group" -ForegroundColor White
Write-Host "4. Create ECS Service" -ForegroundColor White

