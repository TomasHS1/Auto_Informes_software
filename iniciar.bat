@echo off
chcp 65001 >nul
title Auto Informes Colaborativo
echo.
echo ╔══════════════════════════════════════════════╗
echo ║   AUTO INFORMES COLABORATIVO 2026          ║
echo ╚══════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: ── Paso 1: Buildear frontend si no existe o si se solicita ──
if not exist "frontend\dist\index.html" (
    echo [1/3] Buildeando frontend por primera vez...
    cd frontend
    call npm install --silent
    call npm run build
    cd ..
    echo        Frontend buildeado en frontend\dist\
) else (
    echo [1/3] Frontend ya buildeado. Para re-buildear: npm run build --prefix frontend
)

:: ── Paso 2: Iniciar servidor Python en ventana propia ──
echo [2/3] Iniciando servidor en http://localhost:8000 ...
start "Servidor Auto Informes" cmd /c "cd /d %~dp0 && uvicorn servidor_ws:app --host 0.0.0.0 --port 8000 && pause"

:: Esperar a que el servidor arranque
echo        Esperando al servidor...
timeout /t 3 /nobreak >nul

:: ── Paso 3: Abrir túnel público ──
echo.
echo [3/3] Iniciando túnel público...
echo.
echo   ⚠  IMPORTANTE: Copia la URL que aparece abajo (https://xxxx.xxx)
echo      y compártela con tu grupo por WhatsApp / Discord.
echo.

:: Intentar ngrok primero, luego cloudflared como fallback
where ngrok >nul 2>&1
if %errorlevel% equ 0 (
    echo       Usando Ngrok...
    ngrok http 8000
) else (
    where cloudflared >nul 2>&1
    if %errorlevel% equ 0 (
        echo       Usando Cloudflare Tunnel...
        cloudflared tunnel --url http://localhost:8000
    ) else (
        echo.
        echo   ❌  No se encontró ngrok ni cloudflared.
        echo.
        echo   Para exponer tu servidor a internet, instala uno de estos:
        echo     • Ngrok:    https://ngrok.com/download
        echo     • Cloudflare: npx cloudflared tunnel --url http://localhost:8000
        echo.
        echo   Mientras tanto, el servidor corre en http://localhost:8000
        echo   (solo accesible desde tu PC).
        echo.
        pause
    )
)
