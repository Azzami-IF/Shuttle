param(
  [string]$EnvPath = ".env",
  [string]$LogFile = "storage\logs\queue-worker.log",
  [int]$RestartDelaySec = 5
)

# Simple helper to run Laravel queue worker persistently on Windows.
# Usage: .\start_queue_worker.ps1

Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)
Write-Output "Starting persistent queue worker..."

# Resolve log path to repository storage folder
$repoRoot = Resolve-Path -Path ".."
$LogFileFull = Join-Path $repoRoot "storage\logs\queue-worker.log"

# Ensure log directory exists
$logDir = Split-Path -Path $LogFileFull -Parent
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }

while ($true) {
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "$timestamp - Launching php artisan queue:work --tries=3 --sleep=3" | Out-File -FilePath $LogFileFull -Append
  # Use cmd.exe to combine stdout and stderr into same log file
  $cmd = "php artisan queue:work --tries=3 --sleep=3 >> `"$LogFileFull`" 2>&1"
  $proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $cmd -PassThru
  $proc | ForEach-Object { Wait-Process -Id $_.Id }
  "$timestamp - Worker exited; restarting in $RestartDelaySec seconds..." | Out-File -FilePath $LogFileFull -Append
  Start-Sleep -Seconds $RestartDelaySec
}
