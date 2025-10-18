# Build and Push Docker Image to ECR

$ErrorActionPreference = "Stop"

Write-Host "Building and Pushing Docker Image to ECR" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Load configuration
$config = Get-Content "aws-config.json" | ConvertFrom-Json

Write-Host "ECR URI: $($config.ECR_URI)" -ForegroundColor Yellow
Write-Host ""

# Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
Set-Location backend
docker build -t collabcanvas-backend:latest -f Dockerfile .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful!" -ForegroundColor Green
Write-Host ""

# Login to ECR
Write-Host "Logging in to ECR..." -ForegroundColor Yellow
$loginCommand = aws ecr get-login-password --region $config.AWS_REGION | docker login --username AWS --password-stdin $config.ECR_URI.Split('/')[0]

Write-Host "Login successful!" -ForegroundColor Green
Write-Host ""

# Tag image
Write-Host "Tagging image..." -ForegroundColor Yellow
docker tag collabcanvas-backend:latest "$($config.ECR_URI):latest"
Write-Host "Tagged as $($config.ECR_URI):latest" -ForegroundColor Green
Write-Host ""

# Push to ECR
Write-Host "Pushing to ECR..." -ForegroundColor Yellow
docker push "$($config.ECR_URI):latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker push failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Docker Image Pushed Successfully!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Image: $($config.ECR_URI):latest" -ForegroundColor Cyan

Set-Location ..

