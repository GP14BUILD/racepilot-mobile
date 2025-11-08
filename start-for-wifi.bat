@echo off
echo Killing any running Metro bundlers...
taskkill /F /IM node.exe 2>nul

echo Waiting 2 seconds...
timeout /t 2 >nul

echo Starting Metro bundler for WiFi connection...
cd /d "%~dp0"
npx expo start --lan

pause
