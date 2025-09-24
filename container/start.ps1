# Starts the Docker stack and opens the app in your browser when ready
param(
    [switch]$Rebuild
)

$ErrorActionPreference = 'Stop'

# Ensure we run from this script's folder
Set-Location -Path $PSScriptRoot

$composeCmd = "docker compose up -d" + ($(if ($Rebuild) {" --build"} else {""}))

Write-Host "Starting containers..." -ForegroundColor Cyan
Invoke-Expression $composeCmd

# Wait for the frontend to be reachable
$maxAttempts = 60
$attempt = 0
$frontendUrl = "http://localhost:3000"

Write-Host "Waiting for frontend to be ready at $frontendUrl ..." -ForegroundColor Yellow

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
            Write-Host "Frontend is up! Opening browser..." -ForegroundColor Green
            Start-Process $frontendUrl
            break
        }
    } catch {
        Start-Sleep -Seconds 2
    }
    $attempt++
}

# Tail logs for convenience
Write-Host "Streaming logs (Ctrl+C para parar)..." -ForegroundColor Cyan
docker compose logs -f

if ($attempt -ge $maxAttempts) {
    Write-Host "Timeout waiting for frontend. You can open $frontendUrl manually." -ForegroundColor Red
}
