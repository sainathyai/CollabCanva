# Create Application Load Balancer and ECS Service

$ErrorActionPreference = "Continue"

Write-Host "Creating ALB and ECS Service" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Load configuration
$config = Get-Content "aws-config.json" | ConvertFrom-Json

# Create Application Load Balancer
Write-Host "Creating Application Load Balancer..." -ForegroundColor Yellow
$ALB_NAME = "$($config.PROJECT_NAME)-alb"

$albResult = aws elbv2 create-load-balancer `
    --name $ALB_NAME `
    --subnets $config.SUBNET_1 $config.SUBNET_2 `
    --security-groups $config.ALB_SG_ID `
    --scheme internet-facing `
    --type application `
    --region $config.AWS_REGION `
    --query 'LoadBalancers[0].LoadBalancerArn' `
    --output text 2>&1

if ($albResult -like "*already exists*") {
    $ALB_ARN = aws elbv2 describe-load-balancers `
        --names $ALB_NAME `
        --region $config.AWS_REGION `
        --query 'LoadBalancers[0].LoadBalancerArn' `
        --output text
    Write-Host "Using existing ALB" -ForegroundColor Green
} else {
    $ALB_ARN = $albResult
    Write-Host "Created ALB" -ForegroundColor Green
}

# Get ALB DNS
$ALB_DNS = aws elbv2 describe-load-balancers `
    --load-balancer-arns $ALB_ARN `
    --region $config.AWS_REGION `
    --query 'LoadBalancers[0].DNSName' `
    --output text

Write-Host "ALB ARN: $ALB_ARN" -ForegroundColor Cyan
Write-Host "ALB DNS: $ALB_DNS" -ForegroundColor Cyan
Write-Host ""

# Create Target Group
Write-Host "Creating Target Group..." -ForegroundColor Yellow
$TG_NAME = "$($config.PROJECT_NAME)-tg"

$tgResult = aws elbv2 create-target-group `
    --name $TG_NAME `
    --protocol HTTP `
    --port 8080 `
    --vpc-id $config.VPC_ID `
    --target-type ip `
    --health-check-path /health `
    --health-check-interval-seconds 30 `
    --region $config.AWS_REGION `
    --query 'TargetGroups[0].TargetGroupArn' `
    --output text 2>&1

if ($tgResult -like "*already exists*") {
    $TG_ARN = aws elbv2 describe-target-groups `
        --names $TG_NAME `
        --region $config.AWS_REGION `
        --query 'TargetGroups[0].TargetGroupArn' `
        --output text
    Write-Host "Using existing Target Group" -ForegroundColor Green
} else {
    $TG_ARN = $tgResult
    Write-Host "Created Target Group" -ForegroundColor Green
}

Write-Host "Target Group ARN: $TG_ARN" -ForegroundColor Cyan
Write-Host ""

# Create HTTP Listener
Write-Host "Creating HTTP Listener..." -ForegroundColor Yellow
aws elbv2 create-listener `
    --load-balancer-arn $ALB_ARN `
    --protocol HTTP `
    --port 80 `
    --default-actions "Type=forward,TargetGroupArn=$TG_ARN" `
    --region $config.AWS_REGION 2>&1 | Out-Null

Write-Host "HTTP Listener created" -ForegroundColor Green
Write-Host ""

# Create Task Definition
Write-Host "Creating ECS Task Definition..." -ForegroundColor Yellow

$taskDef = @"
{
  "family": "$($config.PROJECT_NAME)-backend-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "$($config.EXECUTION_ROLE_ARN)",
  "taskRoleArn": "$($config.TASK_ROLE_ARN)",
  "containerDefinitions": [
    {
      "name": "$($config.PROJECT_NAME)-backend",
      "image": "$($config.ECR_URI):latest",
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
          "valueFrom": "/collabcanvas/prod/firebase-project-id"
        },
        {
          "name": "FIREBASE_CLIENT_EMAIL",
          "valueFrom": "/collabcanvas/prod/firebase-client-email"
        },
        {
          "name": "FIREBASE_PRIVATE_KEY",
          "valueFrom": "/collabcanvas/prod/firebase-private-key"
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
          "value": "$($config.AWS_REGION)"
        },
        {
          "name": "DYNAMODB_TABLE_PREFIX",
          "value": "collabcanvas"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "$($config.LOG_GROUP_NAME)",
          "awslogs-region": "$($config.AWS_REGION)",
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
"@

$taskDef | Out-File -FilePath "$env:TEMP\task-definition.json" -Encoding utf8

aws ecs register-task-definition `
    --cli-input-json "file://$env:TEMP\task-definition.json" `
    --region $config.AWS_REGION 2>&1 | Out-Null

Write-Host "Task Definition registered" -ForegroundColor Green
Write-Host ""

# Create ECS Service
Write-Host "Creating ECS Service..." -ForegroundColor Yellow
$SERVICE_NAME = "$($config.PROJECT_NAME)-backend-service"
$CLUSTER_NAME = "$($config.PROJECT_NAME)-cluster"

$serviceResult = aws ecs create-service `
    --cluster $CLUSTER_NAME `
    --service-name $SERVICE_NAME `
    --task-definition "$($config.PROJECT_NAME)-backend-task" `
    --desired-count 2 `
    --launch-type FARGATE `
    --network-configuration "awsvpcConfiguration={subnets=[$($config.SUBNET_1),$($config.SUBNET_2)],securityGroups=[$($config.ECS_SG_ID)],assignPublicIp=ENABLED}" `
    --load-balancers "targetGroupArn=$TG_ARN,containerName=$($config.PROJECT_NAME)-backend,containerPort=8080" `
    --health-check-grace-period-seconds 60 `
    --region $config.AWS_REGION 2>&1

if ($serviceResult -like "*already exists*") {
    Write-Host "Service already exists - updating service..." -ForegroundColor Yellow
    aws ecs update-service `
        --cluster $CLUSTER_NAME `
        --service $SERVICE_NAME `
        --force-new-deployment `
        --region $config.AWS_REGION 2>&1 | Out-Null
    Write-Host "Service updated" -ForegroundColor Green
} else {
    Write-Host "Service created" -ForegroundColor Green
}

Write-Host ""

# Update configuration with ALB DNS
$config | Add-Member -NotePropertyName "ALB_DNS" -NotePropertyValue $ALB_DNS -Force
$config | Add-Member -NotePropertyName "ALB_ARN" -NotePropertyValue $ALB_ARN -Force
$config | Add-Member -NotePropertyName "TARGET_GROUP_ARN" -NotePropertyValue $TG_ARN -Force
$config | ConvertTo-Json | Out-File -FilePath "aws-config.json" -Encoding utf8

Write-Host "=====================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your backend is deploying!" -ForegroundColor Cyan
Write-Host "Backend URL: http://$ALB_DNS" -ForegroundColor Yellow
Write-Host "WebSocket URL: ws://$ALB_DNS" -ForegroundColor Yellow
Write-Host ""
Write-Host "Monitor deployment:" -ForegroundColor Cyan
Write-Host "  aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $($config.AWS_REGION)" -ForegroundColor White
Write-Host ""
Write-Host "View logs:" -ForegroundColor Cyan
Write-Host "  aws logs tail $($config.LOG_GROUP_NAME) --follow --region $($config.AWS_REGION)" -ForegroundColor White

