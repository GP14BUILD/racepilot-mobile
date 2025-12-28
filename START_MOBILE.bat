@echo off
echo ============================================
echo Starting RacePilot Mobile App
echo ============================================
echo.
echo The app is configured to use the production backend:
echo https://racepilot-backend-production.up.railway.app
echo.
echo After starting:
echo 1. Install "Expo Go" app on your phone
echo 2. Scan the QR code that appears
echo 3. App will open on your phone
echo.
echo ============================================
cd /d %~dp0
call npx expo start
