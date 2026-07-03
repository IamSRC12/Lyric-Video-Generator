@echo off
cls
echo.
echo ========================================
echo   QUICK START (Without Local AI)
echo ========================================
echo.
echo This opens the app WITHOUT starting Docker.
echo.
echo You can use cloud APIs instead:
echo - Groq (FREE, fast)
echo - AssemblyAI (100 hours/month free)
echo - Deepgram ($200 credit free)
echo.
echo Opening app...
echo.

start "" "%~dp0index.html"

echo.
echo ========================================
echo   App is now open!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. In the app, select a cloud API provider
echo    (Groq is recommended - FREE and fast)
echo.
echo 2. Get your FREE API key:
echo    Groq: https://console.groq.com/keys
echo.
echo 3. Paste the API key in the app
echo.
echo 4. Upload your audio and create videos!
echo.
echo ========================================
echo.
echo If you want to use LOCAL AI instead:
echo   Run: 1.start.bat
echo   (Takes 3-5 minutes first time)
echo.
pause
