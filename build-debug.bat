@echo off
echo ======================================
echo Building RacePilot Debug APK
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

echo Building debug APK...
echo This may take 2-3 minutes...
echo.

cd android
call gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================
    echo BUILD SUCCESSFUL!
    echo ======================================
    echo.
    echo Your debug APK is ready at:
    echo %~dp0android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo File size:
    dir "%~dp0android\app\build\outputs\apk\debug\app-debug.apk" | find "app-debug.apk"
    echo.
    echo You can now:
    echo 1. Install on device: adb install app-debug.apk
    echo 2. Or copy to phone and install manually
    echo.
    echo Opening folder...
    start explorer "%~dp0android\app\build\outputs\apk\debug"
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
