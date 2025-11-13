# Deploy Backend Update Script
# This script builds, pushes, and updates the ECS service with the new task definition

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying Backend Update" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Load configuration
$configPath = Join-Path $PSScriptRoot "..\aws\aws-config.json"
$config = Get-Content $configPath | ConvertFrom-Json

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   ECR URI: $($config.ECR_URI)"
Write-Host "   Region: $($config.AWS_REGION)"
Write-Host "   Cluster: collabcanvas-cluster"
Write-Host "   Service: collabcanvas-backend-service"
Write-Host ""

# Step 1: Build Docker image
Write-Host "🔨 Step 1: Building Docker image..." -ForegroundColor Blue
$backendPath = Join-Path $PSScriptRoot "..\..\backend"
Set-Location $backendPath

docker build -t collabcanvas-backend:latest -f Dockerfile .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Step 2: Login to ECR
Write-Host "🔐 Step 2: Logging in to ECR..." -ForegroundColor Blue
$ecrBase = $config.ECR_URI.Split('/')[0]
aws ecr get-login-password --region $config.AWS_REGION | docker login --username AWS --password-stdin $ecrBase

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ECR login failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Login successful!" -ForegroundColor Green
Write-Host ""

# Step 3: Tag and push image
Write-Host "📤 Step 3: Tagging and pushing image..." -ForegroundColor Blue
docker tag collabcanvas-backend:latest "$($config.ECR_URI):latest"
docker push "$($config.ECR_URI):latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Image pushed successfully!" -ForegroundColor Green
Write-Host ""

# Step 4: Update ECS service with new task definition
Write-Host "🔄 Step 4: Updating ECS service..." -ForegroundColor Blue
$taskDefArn = aws ecs describe-services `
    --cluster collabcanvas-cluster `
    --services collabcanvas-backend-service `
    --region $config.AWS_REGION `
    --query "services[0].taskDefinition" `
    --output text

# Get the latest revision
$latestRevision = aws ecs list-task-definitions `
    --family-prefix collabcanvas-backend-task `
    --region $config.AWS_REGION `
    --sort DESC `
    --max-items 1 `
    --query "taskDefinitionArns[0]" `
    --output text

Write-Host "   Current task definition: $taskDefArn"
Write-Host "   New task definition: $latestRevision"
Write-Host ""

aws ecs update-service `
    --cluster collabcanvas-cluster `
    --service collabcanvas-backend-service `
    --task-definition $latestRevision `
    --force-new-deployment `
    --region $config.AWS_REGION | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Service update failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Service update initiated!" -ForegroundColor Green
Write-Host ""

# Step 5: Wait for deployment
Write-Host "⏳ Step 5: Waiting for deployment to stabilize..." -ForegroundColor Blue
Write-Host "   This may take 2-5 minutes..." -ForegroundColor Yellow
Write-Host ""

aws ecs wait services-stable `
    --cluster collabcanvas-cluster `
    --services collabcanvas-backend-service `
    --region $config.AWS_REGION

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Deployment may still be in progress. Check status manually." -ForegroundColor Yellow
} else {
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✅ Backend Deployment Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend URL: http://$($config.ALB_DNS)" -ForegroundColor Cyan
Write-Host "Health Check: http://$($config.ALB_DNS)/health" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

