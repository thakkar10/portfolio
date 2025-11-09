# PowerShell Script to Set Desktop Background and Minimize All Windows
# Usage: .\set-desktop-background.ps1 -ImageUrl "https://example.com/image.jpg"
# Or: .\set-desktop-background.ps1 -LocalImagePath "C:\path\to\image.jpg"

param(
    [Parameter(Mandatory=$false)]
    [string]$ImageUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$LocalImagePath,
    
    [Parameter(Mandatory=$false)]
    [string]$Style = "Fill"  # Fill, Fit, Stretch, Tile, Center, Span
)

# Function to set desktop background
function Set-DesktopBackground {
    param(
        [string]$ImagePath,
        [string]$Style
    )
    
    try {
        # Add required Windows API types
        Add-Type -TypeDefinition @"
            using System;
            using System.Runtime.InteropServices;
            public class Wallpaper {
                [DllImport("user32.dll", CharSet=CharSet.Auto)]
                public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
            }
"@
        
        # Set the desktop background
        $result = [Wallpaper]::SystemParametersInfo(20, 0, $ImagePath, 3)
        
        if ($result -eq 1) {
            Write-Host "Desktop background set successfully!" -ForegroundColor Green
        } else {
            Write-Host "Failed to set desktop background." -ForegroundColor Red
        }
    }
    catch {
        Write-Host "Error setting desktop background: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to minimize all windows
function Minimize-AllWindows {
    try {
        # Get all visible windows
        $shell = New-Object -ComObject Shell.Application
        $windows = $shell.Windows()
        
        foreach ($window in $windows) {
            try {
                $window.Quit()
            }
            catch {
                # Some windows can't be closed this way, continue
            }
        }
        
        # Alternative method using Win32 API
        Add-Type -TypeDefinition @"
            using System;
            using System.Runtime.InteropServices;
            public class WindowManager {
                [DllImport("user32.dll")]
                public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
                [DllImport("user32.dll")]
                public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
                [DllImport("user32.dll")]
                public static extern IntPtr GetWindow(IntPtr hWnd, uint uCmd);
                [DllImport("user32.dll")]
                public static extern bool IsWindowVisible(IntPtr hWnd);
            }
"@
        
        # Minimize all visible windows
        $SW_MINIMIZE = 6
        $hWnd = [WindowManager]::FindWindow("Shell_TrayWnd", $null)
        
        # Use Windows key + M to minimize all windows (most reliable method)
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.SendKeys]::SendWait("^{ESC}m")
        
        Write-Host "All windows minimized!" -ForegroundColor Green
    }
    catch {
        Write-Host "Error minimizing windows: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to download image to temporary location
function Get-ImageFromUrl {
    param([string]$Url)
    
    try {
        $tempPath = [System.IO.Path]::GetTempPath()
        $fileName = "desktop_bg_" + [System.Guid]::NewGuid().ToString() + ".jpg"
        $fullPath = Join-Path $tempPath $fileName
        
        Write-Host "Downloading image from: $Url" -ForegroundColor Yellow
        
        # Download the image
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($Url, $fullPath)
        
        Write-Host "Image downloaded to: $fullPath" -ForegroundColor Green
        return $fullPath
    }
    catch {
        Write-Host "Error downloading image: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Main execution
Write-Host "=== Desktop Background and Window Manager ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator (recommended for some operations)
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "Note: Running without administrator privileges. Some operations may be limited." -ForegroundColor Yellow
}

# Determine image source and set background
$imagePath = $null

if ($ImageUrl) {
    $imagePath = Get-ImageFromUrl -Url $ImageUrl
    if (-not $imagePath) {
        Write-Host "Failed to download image. Exiting." -ForegroundColor Red
        exit 1
    }
}
elseif ($LocalImagePath) {
    if (Test-Path $LocalImagePath) {
        $imagePath = $LocalImagePath
        Write-Host "Using local image: $LocalImagePath" -ForegroundColor Green
    } else {
        Write-Host "Local image not found: $LocalImagePath" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "No image specified. Please provide either -ImageUrl or -LocalImagePath" -ForegroundColor Red
    Write-Host "Usage examples:" -ForegroundColor Yellow
    Write-Host "  .\set-desktop-background.ps1 -ImageUrl 'https://example.com/image.jpg'" -ForegroundColor White
    Write-Host "  .\set-desktop-background.ps1 -LocalImagePath 'C:\path\to\image.jpg'" -ForegroundColor White
    exit 1
}

# Set the desktop background
Write-Host ""
Write-Host "Setting desktop background..." -ForegroundColor Yellow
Set-DesktopBackground -ImagePath $imagePath -Style $Style

# Wait a moment for the background to set
Start-Sleep -Seconds 2

# Minimize all windows
Write-Host ""
Write-Host "Minimizing all windows..." -ForegroundColor Yellow
Minimize-AllWindows

# Clean up temporary file if we downloaded one
if ($ImageUrl -and $imagePath -and (Test-Path $imagePath)) {
    try {
        Remove-Item $imagePath -Force
        Write-Host "Temporary image file cleaned up." -ForegroundColor Green
    }
    catch {
        Write-Host "Could not clean up temporary file: $imagePath" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Script completed!" -ForegroundColor Cyan
