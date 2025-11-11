@echo off
echo ========================================
echo Move RacePilot to Shorter Path
echo ========================================
echo.
echo This will move your entire racepilot project from:
echo   C:\racepilot
echo.
echo To:
echo   C:\rp
echo.
echo This is REQUIRED to build React Native with New Architecture on Windows
echo due to CMake/Ninja's 128-character path limit.
echo.
echo IMPORTANT:
echo - Close Android Studio before continuing
echo - Close any terminals/editors with files open
echo - This script will copy everything, including git history
echo.
pause

echo.
echo Checking if C:\rp already exists...
if exist "C:\rp" (
    echo.
    echo ERROR: C:\rp already exists!
    echo Please rename or remove it first.
    echo.
    pause
    exit /b 1
)

echo.
echo Creating C:\rp directory...
mkdir "C:\rp"

echo.
echo Moving project (this may take a minute)...
echo.
robocopy "C:\racepilot" "C:\rp" /E /MOVE /R:3 /W:5

if %errorLevel% GEQ 8 (
    echo.
    echo ERROR: Failed to move files!
    echo Error code: %errorLevel%
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS!
echo ========================================
echo.
echo Your project has been moved to: C:\rp
echo.
echo NEXT STEPS:
echo 1. Open Android Studio
echo 2. Close any open projects
echo 3. Open: C:\rp\racepilot-mobile\android
echo 4. Let Gradle sync
echo 5. Build -^> Clean Project
echo 6. Build -^> Build APK
echo.
echo Your old directory C:\racepilot can be deleted if the build works.
echo.
pause
