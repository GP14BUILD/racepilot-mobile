@echo off
echo Setting up USB connection for RacePilot...
echo.

REM Try to find adb in common Android SDK locations
set ADB_PATH=

if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    set ADB_PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
    echo Found ADB at: %ADB_PATH%
) else if exist "%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe" (
    set ADB_PATH=%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe
    echo Found ADB at: %ADB_PATH%
) else (
    echo ERROR: Could not find adb.exe
    echo Please make sure Android SDK is installed via Android Studio
    echo.
    echo Or manually run this command with full path:
    echo "C:\Users\YOUR_USER\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
    pause
    exit /b 1
)

echo.
echo Checking connected devices...
"%ADB_PATH%" devices

echo.
echo Setting up port forwarding...
"%ADB_PATH%" reverse tcp:8081 tcp:8081

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Success! Port forwarding is set up.
    echo Metro bundler on localhost:8081 is now accessible from your phone.
    echo.
    echo Now tap "RELOAD (R, R)" on your phone to retry.
) else (
    echo.
    echo ERROR: Failed to set up port forwarding.
    echo Make sure your phone is connected and USB debugging is enabled.
)

echo.
pause
