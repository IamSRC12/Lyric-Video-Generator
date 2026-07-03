@echo off
title 🐳 Docker Whisper Setup
color 0B

echo.
echo ========================================================================
echo                    DOCKER WHISPER SETUP
echo                    Local AI for Lyric Video Generator
echo ========================================================================
echo.

echo [1/4] Checking Docker Desktop...
timeout /t 2 /nobreak >nul

docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Docker Desktop is not running!
    echo Starting Docker Desktop...
    echo.
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo.
    echo Waiting for Docker to start (this may take 60 seconds)...
    timeout /t 10 /nobreak >nul
    
    :WAIT_DOCKER
    docker ps >nul 2>&1
    if %errorlevel% neq 0 (
        echo Still waiting...
        timeout /t 5 /nobreak >nul
        goto WAIT_DOCKER
    )
)

echo Docker Desktop is running!
echo.

echo [2/4] Checking for existing Whisper container...
timeout /t 1 /nobreak >nul

docker ps -a | findstr whisper-local >nul 2>&1
if %errorlevel% equ 0 (
    echo Found existing container. Removing...
    docker rm -f whisper-local >nul 2>&1
)

echo.
echo [3/4] Pulling Whisper image (this may take a few minutes)...
echo.

docker pull onerahmet/openai-whisper-asr-webservice:latest

echo.
echo [4/4] Starting Whisper container...
echo.

docker run -d ^
  --name whisper-local ^
  -p 5000:5000 ^
  onerahmet/openai-whisper-asr-webservice:latest

if %errorlevel% equ 0 (
    echo.
    echo ========================================================================
    echo                    SUCCESS!
    echo ========================================================================
    echo.
    echo Local Whisper AI is now running!
    echo.
    echo Service URL: http://localhost:5000
    echo Container Name: whisper-local
    echo.
    echo To use in Lyric Video Generator:
    echo 1. Open the app
    echo 2. Select "Local Docker" in API Provider
    echo 3. Click "AI Sync & Analyze"
    echo 4. Enjoy unlimited free processing!
    echo.
    echo ========================================================================
    echo.
    echo Useful commands:
    echo   docker logs whisper-local    - View logs
    echo   docker stop whisper-local    - Stop service
    echo   docker start whisper-local   - Start service
    echo   docker rm whisper-local      - Remove container
    echo.
    echo ========================================================================
) else (
    echo.
    echo ERROR: Failed to start Whisper container!
    echo.
    echo Please check:
    echo 1. Docker Desktop is running
    echo 2. Port 5000 is not in use
    echo 3. You have internet connection (for first-time pull)
    echo.
)

echo.
echo Press any key to exit...
pause >nul
