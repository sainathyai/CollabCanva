# Store Secrets in AWS Systems Manager Parameter Store

$ErrorActionPreference = "Continue"

Write-Host "Setting up SSM Parameter Store Secrets" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Load configuration
$config = Get-Content "aws-config.json" | ConvertFrom-Json
$PARAM_PREFIX = "/collabcanvas/prod"

Write-Host "Parameter Prefix: $PARAM_PREFIX" -ForegroundColor Yellow
Write-Host "Region: $($config.AWS_REGION)" -ForegroundColor Yellow
Write-Host ""

# Function to store parameter
function Store-Parameter {
    param(
        [string]$Name,
        [string]$Value,
        [string]$Type = "String"
    )
    
    $fullName = "$PARAM_PREFIX/$Name"
    Write-Host "Storing: $fullName" -ForegroundColor Gray
    
    aws ssm put-parameter `
        --name $fullName `
        --value $Value `
        --type $Type `
        --overwrite `
        --region $config.AWS_REGION 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK $Name" -ForegroundColor Green
    } else {
        Write-Host "  Failed: $Name" -ForegroundColor Red
    }
}

# Store non-sensitive config
Write-Host "Storing configuration parameters..." -ForegroundColor Yellow
Store-Parameter -Name "node-env" -Value "production"
Store-Parameter -Name "port" -Value "8080"
Store-Parameter -Name "aws-region" -Value $config.AWS_REGION
Store-Parameter -Name "dynamodb-table-prefix" -Value "collabcanvas"
Write-Host ""

# Prompt for sensitive values
Write-Host "Enter sensitive values (Firebase credentials):" -ForegroundColor Yellow
Write-Host ""

$firebaseProjectId = Read-Host "Firebase Project ID"
if ($firebaseProjectId) {
    Store-Parameter -Name "firebase-project-id" -Value $firebaseProjectId
}

$firebaseClientEmail = Read-Host "Firebase Client Email"
if ($firebaseClientEmail) {
    Store-Parameter -Name "firebase-client-email" -Value $firebaseClientEmail -Type "SecureString"
}

Write-Host ""
Write-Host "Firebase Private Key (paste the entire key including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)" -ForegroundColor Yellow
Write-Host "Then press Enter twice:" -ForegroundColor Yellow
$firebasePrivateKey = @()
do {
    $line = Read-Host
    if ($line) {
        $firebasePrivateKey += $line
    }
} while ($line)

if ($firebasePrivateKey.Count -gt 0) {
    $privateKeyValue = $firebasePrivateKey -join "`n"
    Store-Parameter -Name "firebase-private-key" -Value $privateKeyValue -Type "SecureString"
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Secrets Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Stored parameters:" -ForegroundColor Cyan
Write-Host "  - node-env" -ForegroundColor White
Write-Host "  - port" -ForegroundColor White
Write-Host "  - aws-region" -ForegroundColor White
Write-Host "  - dynamodb-table-prefix" -ForegroundColor White
Write-Host "  - firebase-project-id" -ForegroundColor White
Write-Host "  - firebase-client-email (encrypted)" -ForegroundColor White
Write-Host "  - firebase-private-key (encrypted)" -ForegroundColor White

