@echo off
echo Installing RacePilot on your Android phone...
echo.
echo Make sure:
echo 1. Your phone is connected via USB
echo 2. USB debugging is enabled
echo 3. You've allowed USB debugging from this computer
echo.
pause

cd /d "%~dp0"
echo Building and installing...
npx expo run:android

echo.
echo Done! The app should now be on your phone.
pause
