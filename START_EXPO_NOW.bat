@echo off
cd /d %~dp0
echo ============================================
echo Starting RacePilot Mobile App
echo ============================================
echo.
echo After the QR code appears:
echo 1. Install "Expo Go" app on your phone
echo 2. Open Expo Go app
echo 3. Tap "Scan QR code"
echo 4. Scan the QR code shown below
echo.
echo ============================================
echo.
call npx expo start
