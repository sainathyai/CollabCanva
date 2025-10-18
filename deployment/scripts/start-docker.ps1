# PowerShell script to start CollabCanvas with Docker
# Run this with: .\start-docker.ps1

Write-Host "Starting CollabCanvas with Docker..." -ForegroundColor Green
Write-Host ""

# Check if Docker is running
$dockerRunning = docker info 2>&1 | Select-String "Server Version"
if (-not $dockerRunning) {
    Write-Host "Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "No .env file found. Creating from template..." -ForegroundColor Yellow
    Copy-Item "env.docker.example" ".env"
    Write-Host "Created .env file. Please edit it with your Firebase credentials." -ForegroundColor Green
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 0
}

Write-Host "Docker is running" -ForegroundColor Green
Write-Host "Environment file found" -ForegroundColor Green
Write-Host ""

# Start Docker Compose
Write-Host "Starting containers..." -ForegroundColor Cyan
docker-compose up --build

# This will only run if user stops with Ctrl+C
Write-Host ""
Write-Host "Stopped. Run 'docker-compose down' to remove containers." -ForegroundColor Yellow
