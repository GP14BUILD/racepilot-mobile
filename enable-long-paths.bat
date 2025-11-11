@echo off
echo ========================================
echo Enable Windows Long Path Support
echo ========================================
echo.
echo This will enable support for file paths longer than 260 characters.
echo This is required for building React Native apps on Windows.
echo.
echo NOTE: This requires Administrator privileges.
echo.
pause

echo Checking if running as Administrator...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as Administrator. Proceeding...
    echo.
) else (
    echo ERROR: Not running as Administrator!
    echo.
    echo Please right-click this script and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

echo Enabling long path support in registry...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f

if %errorLevel% == 0 (
    echo.
    echo ========================================
    echo SUCCESS!
    echo ========================================
    echo.
    echo Long path support has been enabled.
    echo.
    echo IMPORTANT: You may need to restart your computer
    echo for this change to take full effect.
    echo.
    echo You can also enable it in Git (if you use Git):
    echo   git config --system core.longpaths true
    echo.
) else (
    echo.
    echo ========================================
    echo FAILED!
    echo ========================================
    echo.
    echo Could not enable long path support.
    echo Make sure you're running as Administrator.
    echo.
)

pause
