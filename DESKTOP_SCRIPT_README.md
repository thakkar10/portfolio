# Desktop Background and Window Manager Scripts

This collection of scripts allows you to set a desktop background image and minimize all windows on Windows systems.

## Files Included

- `set-desktop-background.ps1` - Main PowerShell script with full functionality
- `set-desktop-background.bat` - Batch file wrapper for easier execution
- `example-usage.bat` - Example demonstrating how to use the scripts

## Features

✅ **Set Desktop Background**: Downloads image from URL or uses local file  
✅ **Minimize All Windows**: Automatically minimizes all open windows  
✅ **No Local Storage**: Downloads images to temp folder and cleans up  
✅ **Multiple Input Methods**: Supports both URLs and local file paths  
✅ **Error Handling**: Comprehensive error checking and user feedback  

## Usage

### Method 1: Using the Batch File (Recommended)

```batch
# With image URL
set-desktop-background.bat "https://example.com/image.jpg"

# With local image path
set-desktop-background.bat "C:\path\to\image.jpg"
```

### Method 2: Using PowerShell Directly

```powershell
# With image URL
.\set-desktop-background.ps1 -ImageUrl "https://example.com/image.jpg"

# With local image path
.\set-desktop-background.ps1 -LocalImagePath "C:\path\to\image.jpg"

# With custom style
.\set-desktop-background.ps1 -ImageUrl "https://example.com/image.jpg" -Style "Stretch"
```

### Method 3: Run Example

Simply double-click `example-usage.bat` to see the script in action with a sample image.

## Parameters

### PowerShell Parameters

- `-ImageUrl`: URL of the image to download and set as background
- `-LocalImagePath`: Local file path to an existing image
- `-Style`: Background style (Fill, Fit, Stretch, Tile, Center, Span) - Default: Fill

## Requirements

- Windows operating system
- PowerShell 2.0 or later
- Internet connection (if using image URLs)

## How It Works

1. **Image Handling**: 
   - If URL provided: Downloads image to temporary folder
   - If local path provided: Uses existing file
   - Sets image as desktop background using Windows API

2. **Window Management**:
   - Uses Windows key combination to minimize all windows
   - Provides visual feedback of the process

3. **Cleanup**:
   - Automatically removes temporary downloaded images
   - Provides status updates throughout the process

## Security Notes

- Scripts use Windows API calls for desktop management
- Downloaded images are stored in system temp folder and cleaned up
- No permanent files are created on the system
- PowerShell execution policy may need to be adjusted for first run

## Troubleshooting

### PowerShell Execution Policy Error
If you get an execution policy error, run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Image Not Setting
- Ensure the image URL is accessible
- Check that the image format is supported (JPG, PNG, BMP)
- Verify you have permission to change desktop settings

### Windows Not Minimizing
- Some applications may not respond to the minimize command
- Try running the script as Administrator for better compatibility

## Example URLs for Testing

- Random images: `https://picsum.photos/1920/1080`
- Nature: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080`
- Abstract: `https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080`

## License

These scripts are provided as-is for educational and personal use. Use responsibly and in accordance with your organization's policies.
