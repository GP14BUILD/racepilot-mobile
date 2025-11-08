@echo off
echo ======================================
echo Building RacePilot Standalone APK
echo ======================================
echo.

cd /d "%~dp0\android"

REM Check if keystore exists
if not exist "app\racepilot-release.keystore" (
    echo Generating release keystore...
    echo You'll be asked to create a password. Remember it!
    echo.
    cd app
    keytool -genkeypair -v -storetype PKCS12 -keystore racepilot-release.keystore -alias racepilot-key -keyalg RSA -keysize 2048 -validity 10000
    cd ..
    echo.
    echo Keystore created successfully!
    echo.
)

echo Building release APK...
echo This may take a few minutes...
echo.

call gradlew assembleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================
    echo BUILD SUCCESSFUL!
    echo ======================================
    echo.
    echo Your APK is ready at:
    echo %~dp0android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo You can now:
    echo 1. Copy this APK to any Android phone
    echo 2. Install it directly (enable "Install from unknown sources")
    echo 3. No Expo Go required!
    echo.
    start explorer "%~dp0android\app\build\outputs\apk\release"
) else (
    echo.
    echo ======================================
    echo BUILD FAILED!
    echo ======================================
    echo Check the error messages above.
)

echo.
pause
