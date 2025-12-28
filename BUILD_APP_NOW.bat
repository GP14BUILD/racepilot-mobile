@echo off
echo ============================================
echo Building RacePilot Mobile APK
echo ============================================
echo.
echo This will build a standalone APK that you can install
echo directly on your Android phone.
echo.
echo Build time: ~20-30 minutes
echo.
echo Steps:
echo 1. This script will start the build
echo 2. You may need to login to Expo (create free account if needed)
echo 3. Build happens in the cloud
echo 4. You'll get a download link when complete
echo 5. Download APK and install on your phone
echo.
echo ============================================
echo.
pause
cd /d %~dp0
call npx eas-cli login
echo.
echo Starting build...
call npx eas-cli build --platform android --profile preview --non-interactive
echo.
echo ============================================
echo Build complete! Check the link above to download your APK
echo ============================================
pause
