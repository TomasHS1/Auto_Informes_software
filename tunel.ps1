Write-Host "=== TUNEL PUBLICO localtunnel ===" -ForegroundColor Magenta
Write-Host "Descargando..."
npx localtunnel --port 8000 --print-requests 2>&1 | ForEach-Object {
    Write-Host $_
    if ($_ -match "https://[a-zA-Z0-9]+\.loca\.lt") {
        $url = $matches[0]
        $url | Out-File -FilePath "tunnel_url.txt" -Encoding utf8
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "COMPARTI ESTE LINK CON TU GRUPO:" -ForegroundColor Yellow
        Write-Host $url -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Green
    }
}
