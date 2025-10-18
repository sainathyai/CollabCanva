# CollabCanvas Local Development Starter
# Starts both backend and frontend in separate windows

Write-Host "🚀 Starting CollabCanvas Local Development..." -ForegroundColor Green
Write-Host ""

# Check if node_modules exist
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "⚠️  Backend dependencies not found. Installing..." -ForegroundColor Yellow
    cd backend
    npm install
    cd ..
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "⚠️  Frontend dependencies not found. Installing..." -ForegroundColor Yellow
    cd frontend
    npm install
    cd ..
}

# Check if .env files exist
if (-not (Test-Path "backend/.env")) {
    Write-Host "⚠️  Backend .env not found. Copying from example..." -ForegroundColor Yellow
    Copy-Item "backend/env.example.txt" "backend/.env"
}

if (-not (Test-Path "frontend/.env")) {
    Write-Host "⚠️  Frontend .env not found. Copying from example..." -ForegroundColor Yellow
    Copy-Item "frontend/env.example.txt" "frontend/.env"
    Write-Host "⚠️  Please edit frontend/.env with your Firebase credentials" -ForegroundColor Yellow
}

Write-Host "✅ All dependencies and config files ready!" -ForegroundColor Green
Write-Host ""

# Start backend
Write-Host "🔧 Starting Backend (Port 8080)..." -ForegroundColor Cyan
$backendPath = Join-Path $PWD "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🔧 Backend Server' -ForegroundColor Cyan; npm run dev"

Start-Sleep -Seconds 2

# Start frontend
Write-Host "⚡ Starting Frontend (Port 5173)..." -ForegroundColor Magenta
$frontendPath = Join-Path $PWD "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '⚡ Frontend Server' -ForegroundColor Magenta; npm run dev"

Write-Host ""
Write-Host "✅ Both services starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Keep both terminal windows open while developing" -ForegroundColor Yellow
Write-Host "🛑 To stop: Press Ctrl+C in each window" -ForegroundColor Yellow

