@echo off
REM Batch file to set desktop background and minimize all windows
REM Usage: set-desktop-background.bat [image_url_or_path]

setlocal enabledelayedexpansion

echo ===============================================
echo    Desktop Background and Window Manager
echo ===============================================
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: PowerShell is not available on this system.
    echo Please install PowerShell or run the .ps1 file directly.
    pause
    exit /b 1
)

REM Check if an argument was provided
if "%~1"=="" (
    echo Usage: %0 [image_url_or_path]
    echo.
    echo Examples:
    echo   %0 "https://example.com/image.jpg"
    echo   %0 "C:\path\to\image.jpg"
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

set "image_input=%~1"

REM Determine if it's a URL or local path
echo %image_input% | findstr /i "http" >nul
if %errorlevel% equ 0 (
    echo Detected URL input. Downloading image...
    powershell -ExecutionPolicy Bypass -File "%~dp0set-desktop-background.ps1" -ImageUrl "%image_input%"
) else (
    echo Detected local path input.
    powershell -ExecutionPolicy Bypass -File "%~dp0set-desktop-background.ps1" -LocalImagePath "%image_input%"
)

if %errorlevel% equ 0 (
    echo.
    echo Script completed successfully!
) else (
    echo.
    echo Script encountered an error.
)

echo.
echo Press any key to exit...
pause >nul
