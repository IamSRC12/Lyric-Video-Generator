@echo off
title 🎬 Ultimate Lyric Video Generator - Launcher
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                                                          ║
echo ║   🎬 ULTIMATE LYRIC VIDEO GENERATOR 🎬                  ║
echo ║                                                          ║
echo ║   ✨ Professional Timeline Editor                        ║
echo ║   🎨 30+ Advanced Animations                            ║
echo ║   🤖 AI-Powered Features                                ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo.

echo [1/3] Checking files...
timeout /t 1 /nobreak >nul

if not exist "index.html" (
    color 0C
    echo ❌ ERROR: index.html not found!
    echo Please run this from the Lyric-Video-Generator folder.
    pause
    exit /b 1
)

echo ✅ Files found!
echo.

echo [2/3] Checking Docker (for AI features)...
timeout /t 1 /nobreak >nul

docker ps >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker is running - AI features available!
    echo.
    echo Starting local AI services...
    cd docker 2>nul
    if exist "docker-compose.yml" (
        start /min cmd /c "docker-compose up"
        echo ✅ AI services starting in background...
    )
    cd ..
) else (
    echo ⚠️  Docker not running - AI features will use fallback mode
    echo    (You can still use all features, AI suggestions will be rule-based)
)
echo.

echo [3/3] Opening Lyric Video Generator...
timeout /t 1 /nobreak >nul

REM Open in default browser
start "" "index.html"

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                                                          ║
echo ║   ✅ LYRIC VIDEO GENERATOR IS NOW OPEN!                 ║
echo ║                                                          ║
echo ║   📚 Quick Start:                                        ║
echo ║   1. Upload your audio file                             ║
echo ║   2. Paste lyrics (or let AI detect)                    ║
echo ║   3. Click "AI Sync & Analyze"                          ║
echo ║   4. Use Timeline Editor to fine-tune                   ║
echo ║   5. Choose from 30+ animations                         ║
echo ║   6. Export your video!                                 ║
echo ║                                                          ║
echo ║   📖 Documentation:                                      ║
echo ║   - QUICK_START_ULTIMATE.md                             ║
echo ║   - ULTIMATE_UPGRADE_GUIDE.md                           ║
echo ║   - FEATURES_SHOWCASE.md                                ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo.

echo Press any key to open documentation...
pause >nul

REM Open documentation
start "" "QUICK_START_ULTIMATE.md"

echo.
echo 🎉 Happy creating! This window will close in 5 seconds...
timeout /t 5 /nobreak >nul

exit
