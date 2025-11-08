@echo off
echo ======================================
echo Building RacePilot Standalone APK
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
    echo Please install Android Studio or set JAVA_HOME manually:
    echo set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
    echo.
    pause
    exit /b 1
)

REM Check if keystore exists
if not exist "android\app\racepilot-release.keystore" (
    echo Generating release keystore...
    echo.
    echo You'll be prompted for:
    echo - Keystore password: Enter a password you'll remember
    echo - Your name and organization details
    echo.
    cd android\app
    keytool -genkeypair -v -storetype PKCS12 -keystore racepilot-release.keystore -alias racepilot-key -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=RacePilot, OU=Mobile, O=RacePilot, L=City, S=State, C=US" -storepass racepilot123 -keypass racepilot123
    cd ..\..
    echo.
    echo Keystore created successfully!
    echo Password: racepilot123
    echo.
)

echo Building release APK...
echo This may take 3-5 minutes...
echo.

cd android
call gradlew.bat assembleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================
    echo BUILD SUCCESSFUL!
    echo ======================================
    echo.
    echo Your APK is ready at:
    echo %~dp0android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo File size:
    dir "%~dp0android\app\build\outputs\apk\release\app-release.apk" | find "app-release.apk"
    echo.
    echo You can now:
    echo 1. Copy this APK to any Android phone
    echo 2. Install it directly - enable "Install from unknown sources"
    echo 3. No Expo Go required!
    echo.
    echo Opening folder...
    start explorer "%~dp0android\app\build\outputs\apk\release"
) else (
    echo.
    echo ======================================
    echo BUILD FAILED!
    echo ======================================
    echo.
    echo Common fixes:
    echo 1. Make sure Android Studio is installed
    echo 2. Try: cd android ^&^& gradlew clean
    echo 3. Open project in Android Studio and build there
    echo.
)

cd ..
echo.
pause
