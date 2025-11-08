@echo off
echo ======================================
echo Building RacePilot for Google Play Store
echo (Android App Bundle - AAB)
echo ======================================
echo.

cd /d "%~dp0"

REM Try to find Java from Android Studio
set "JAVA_HOME="
set "ANDROID_STUDIO_JDK="

REM Check common Android Studio JDK locations
if exist "%LOCALAPPDATA%\Android\Sdk" (
    if exist "%LOCALAPPDATA%\Android\Sdk\jbr" (
        set "ANDROID_STUDIO_JDK=%LOCALAPPDATA%\Android\Sdk\jbr"
    )
)

REM Check Program Files locations
if not defined ANDROID_STUDIO_JDK (
    for /d %%i in ("%ProgramFiles%\Android\Android Studio\jbr*") do (
        set "ANDROID_STUDIO_JDK=%%i"
        goto found_jdk
    )
)

:found_jdk
if defined ANDROID_STUDIO_JDK (
    echo Found Android Studio JDK at: %ANDROID_STUDIO_JDK%
    set "JAVA_HOME=%ANDROID_STUDIO_JDK%"
    set "PATH=%JAVA_HOME%\bin;%PATH%"
    echo.
) else (
    echo ERROR: Could not find Android Studio JDK!
    echo.
    echo Please install Android Studio or set JAVA_HOME manually
    echo.
    pause
    exit /b 1
)

REM Check if keystore exists
if not exist "android\app\racepilot-release.keystore" (
    echo.
    echo ========================================
    echo WARNING: No keystore found!
    echo ========================================
    echo.
    echo For Google Play Store, you need a keystore.
    echo.
    echo Option 1: Run build-apk-fixed.bat first to generate one
    echo Option 2: Create keystore in Android Studio (Build ^> Generate Signed Bundle)
    echo.
    pause
    exit /b 1
)

echo Building release AAB for Google Play Store...
echo This may take 3-5 minutes...
echo.

cd android
call gradlew.bat bundleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================
    echo BUILD SUCCESSFUL!
    echo ======================================
    echo.
    echo Your AAB is ready for Google Play Store at:
    echo %~dp0android\app\build\outputs\bundle\release\app-release.aab
    echo.
    echo File size:
    dir "%~dp0android\app\build\outputs\bundle\release\app-release.aab" | find "app-release.aab"
    echo.
    echo NEXT STEPS:
    echo 1. Upload this AAB to Google Play Console
    echo 2. See PLAY_STORE_GUIDE.md for complete publishing instructions
    echo.
    echo Opening folder...
    start explorer "%~dp0android\app\build\outputs\bundle\release"
) else (
    echo.
    echo ======================================
    echo BUILD FAILED!
    echo ======================================
    echo.
    echo Common fixes:
    echo 1. Make sure Android Studio is installed
    echo 2. Try: cd android ^&^& gradlew clean
    echo 3. Check PLAY_STORE_GUIDE.md for troubleshooting
    echo.
)

cd ..
echo.
pause
