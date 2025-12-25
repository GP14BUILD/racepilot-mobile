@echo off
echo ========================================
echo RacePilot iOS App Builder
echo ========================================
echo.

echo Checking if EAS CLI is installed...
call npx eas --version >nul 2>&1
if %errorlevel% neq 0 (
    echo EAS CLI not found. Installing...
    call npm install -g eas-cli
)

echo.
echo Building iOS app for production...
echo This will take 10-20 minutes.
echo.

cd /d "%~dp0"
call eas build --platform ios --profile production

echo.
echo ========================================
echo Build complete!
echo.
echo Next steps:
echo 1. Download the .ipa file from the link above
echo 2. Submit to App Store: eas submit --platform ios --latest
echo 3. Or test with TestFlight first
echo ========================================
pause
