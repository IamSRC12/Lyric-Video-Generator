# 🚀 Start Docker Whisper - Quick Setup Script

Write-Host "🐳 Docker Whisper Setup" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Docker is installed
Write-Host "Step 1: Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Step 2: Check if Docker is running
Write-Host ""
Write-Host "Step 2: Checking if Docker is running..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$dockerRunning = $false

while ($attempt -lt $maxAttempts -and -not $dockerRunning) {
    try {
        docker ps | Out-Null
        $dockerRunning = $true
        Write-Host "✅ Docker is running!" -ForegroundColor Green
    } catch {
        $attempt++
        if ($attempt -eq 1) {
            Write-Host "⏳ Docker is not running. Starting Docker Desktop..." -ForegroundColor Yellow
            Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
        }
        Write-Host "   Waiting for Docker to start... ($attempt/$maxAttempts)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $dockerRunning) {
    Write-Host "❌ Docker failed to start after $maxAttempts attempts" -ForegroundColor Red
    Write-Host "Please start Docker Desktop manually and try again" -ForegroundColor Yellow
    exit 1
}

# Step 3: Check if Whisper container is already running
Write-Host ""
Write-Host "Step 3: Checking Whisper container status..." -ForegroundColor Yellow
$containerRunning = docker ps --filter "name=whisper-api" --format "{{.Names}}" 2>$null

if ($containerRunning -eq "whisper-api") {
    Write-Host "✅ Whisper API is already running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Testing API..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -TimeoutSec 5
        Write-Host "✅ API is healthy: $($response.status)" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Everything is ready! You can now use the app." -ForegroundColor Green
        Write-Host "   Select 'Local Docker' in the API Provider dropdown" -ForegroundColor Cyan
        exit 0
    } catch {
        Write-Host "⚠️ Container is running but API is not responding" -ForegroundColor Yellow
        Write-Host "   Restarting container..." -ForegroundColor Yellow
        docker-compose restart
        Start-Sleep -Seconds 5
    }
} else {
    Write-Host "⏳ Whisper container is not running. Starting it now..." -ForegroundColor Yellow
}

# Step 4: Start Whisper container
Write-Host ""
Write-Host "Step 4: Starting Whisper API container..." -ForegroundColor Yellow
Write-Host "⏳ This may take 5-10 minutes on first run (downloading model)..." -ForegroundColor Gray

try {
    docker-compose up -d
    Write-Host "✅ Container started!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start container" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Wait for API to be ready
Write-Host ""
Write-Host "Step 5: Waiting for API to be ready..." -ForegroundColor Yellow
$maxWait = 60
$waited = 0
$apiReady = $false

while ($waited -lt $maxWait -and -not $apiReady) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -TimeoutSec 2 -ErrorAction Stop
        if ($response.status -eq "healthy") {
            $apiReady = $true
            Write-Host "✅ API is ready!" -ForegroundColor Green
        }
    } catch {
        $waited += 2
        Write-Host "   Waiting... ($waited/$maxWait seconds)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $apiReady) {
    Write-Host "⚠️ API did not respond within $maxWait seconds" -ForegroundColor Yellow
    Write-Host "   Checking container logs..." -ForegroundColor Yellow
    Write-Host ""
    docker logs whisper-api --tail 20
    Write-Host ""
    Write-Host "The container is running but may still be initializing." -ForegroundColor Yellow
    Write-Host "Wait a few more minutes and try accessing the app." -ForegroundColor Yellow
    exit 1
}

# Success!
Write-Host ""
Write-Host "🎉 SUCCESS! Docker Whisper is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open index.html in your browser" -ForegroundColor White
Write-Host "2. Select 'Local Docker (Unlimited free)' from API Provider" -ForegroundColor White
Write-Host "3. Upload audio and click 'AI Sync & Analyze'" -ForegroundColor White
Write-Host ""
Write-Host "API URL: http://localhost:5000" -ForegroundColor Gray
Write-Host ""
