# PowerShell script to install animated icons

# List of icons to install
$icons = @(
    "airplane", "bell", "calendar-check", "calendar-days", "cart", "home", 
    "user", "settings", "search", "wifi", "coffee", "building", 
    "map-pin", "star", "heart", "message-square", "phone-call", 
    "credit-card", "check-circle", "x-circle", "alert-circle", "info"
)

# Create a log file
$logFile = Join-Path $PSScriptRoot "icon-installation.log"
"Icon installation started at $(Get-Date)" | Out-File -FilePath $logFile

# Function to log messages
function Log-Message {
    param([string]$message)
    Write-Host $message
    Add-Content -Path $logFile -Value $message
}

# Install icons
$successCount = 0
$failCount = 0
$failedIcons = @()

foreach ($icon in $icons) {
    try {
        Log-Message "Installing icon: $icon"
        
        # Run the command and automatically select --force option
        $process = Start-Process -FilePath "npx" -ArgumentList "shadcn@latest", "add", "https://icons.pqoqubbw.dev/c/$icon.json" -NoNewWindow -PassThru
        
        # Wait a bit for the prompt to appear
        Start-Sleep -Seconds 3
        
        # Send the down arrow key and enter to select --force
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
        
        # Wait for the process to complete
        $process.WaitForExit()
        
        if ($process.ExitCode -eq 0) {
            Log-Message "✅ Successfully installed $icon"
            $successCount++
        } else {
            Log-Message "❌ Failed to install $icon with exit code: $($process.ExitCode)"
            $failCount++
            $failedIcons += $icon
        }
    } catch {
        Log-Message "❌ Error installing $icon: $_"
        $failCount++
        $failedIcons += $icon
    }
    
    # Add a small delay between installations
    Start-Sleep -Seconds 1
}

# Log summary
Log-Message ""
Log-Message "==== Installation Summary ===="
Log-Message "Total icons attempted: $($icons.Count)"
Log-Message "Successfully installed: $successCount"
Log-Message "Failed to install: $failCount"

if ($failedIcons.Count -gt 0) {
    Log-Message ""
    Log-Message "Failed icons:"
    foreach ($icon in $failedIcons) {
        Log-Message "- $icon"
    }
}

Log-Message ""
Log-Message "Installation completed at $(Get-Date)"
