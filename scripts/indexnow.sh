# IndexNow setup: generate a random hex key, write the verification file at root,
# and submit a few URLs to the public endpoint. Idempotent.

$key = "af2d7c4b9e1f3a8b6d2c5e9a7b4f1c8e"
Write-Host "Using key: $key"
# Random 32 hex chars; matches IndexNow requirements (8-128 hex)
$key = -join ((1..32) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
# Persist key + verification file
"IndexNow key = $key" | Out-File "$PSScriptRoot\..\INDEXNOW-KEY.txt"
"$key" | Out-File "$PSScriptRoot\..\app-output\$key.txt"
$urls = @(
  "https://asset-forge-hire.vercel.app/",
  "https://asset-forge-hire.vercel.app/hire",
  "https://asset-forge-hire.vercel.app/donate"
)
$body = @{
  host = "asset-forge-hire.vercel.app"
  key = $key
  keyLocation = "https://asset-forge-hire.vercel.app/$key.txt"
  urlList = $urls
} | ConvertTo-Json -Compress
try {
  $r = Invoke-RestMethod -Method POST -Uri "https://api.indexnow.org/indexnow" -Headers @{"Content-Type"="application/json"} -Body $body -TimeoutSec 15
  Write-Host "IndexNow submit: $($r | ConvertTo-Json)"
} catch {
  Write-Host "IndexNow submit: $($_.Exception.Response.StatusCode.value__) $($_.Exception.Message)"
}
