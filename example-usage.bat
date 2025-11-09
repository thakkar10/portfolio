@echo off
REM Example usage of the desktop background script
REM This demonstrates how to use the script with a sample image

echo ===============================================
echo    Example: Setting Desktop Background
echo ===============================================
echo.

REM Example 1: Using a sample image URL (you can replace this with your own)
set "sample_url=https://picsum.photos/1920/1080"

echo Example 1: Setting background from URL
echo URL: %sample_url%
echo.

REM Run the script with the sample URL
call "%~dp0set-desktop-background.bat" "%sample_url%"

echo.
echo ===============================================
echo    Example completed!
echo ===============================================
echo.
echo To use your own image:
echo 1. Replace the URL in this file with your image URL
echo 2. Or use: set-desktop-background.bat "your_image_url_here"
echo 3. Or use: set-desktop-background.bat "C:\path\to\your\image.jpg"
echo.
pause
