@echo off
echo ============================================
echo Building RacePilot Mobile APK
echo ============================================
echo.
echo This will build a production APK file
echo Build time: ~20-30 minutes
echo.
echo Requirements:
echo - Expo account (free)
echo - Internet connection
echo.
echo After build completes:
echo - Download APK from the link provided
echo - Install on Android phone
echo - No Expo Go app needed!
echo.
echo ============================================
pause
cd /d %~dp0
call npx eas build --platform android --profile preview
