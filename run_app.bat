@echo off
echo Starting Lyric Video Generator (Secure Mode)...
echo This ensures High Quality export works perfectly.

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH.
    echo Please install Python to use the High Quality Export features.
    pause
    exit /b
)

:: Start Server in background
start "" python start_server.py

:: Wait a second for server to start
timeout /t 2 >nul

:: Open Browser
start http://localhost:8000

echo App started! You can minimize this window.
pause
