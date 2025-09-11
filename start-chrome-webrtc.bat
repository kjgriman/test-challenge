@echo off
echo 🚀 Iniciando Chrome para WebRTC...
echo.

REM Cerrar Chrome existente
taskkill //F //IM chrome.exe 2>nul

REM Iniciar Chrome con flags mínimos para WebRTC
"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --user-data-dir="C:\temp\chrome_webrtc" ^
  --ignore-certificate-errors ^
  --ignore-ssl-errors ^
  --allow-insecure-localhost ^
  --disable-web-security ^
  --enable-features=WebRTC ^
  --disable-features=VizDisplayCompositor ^
  --enable-webrtc-stun-origin ^
  --disable-background-timer-throttling ^
  --disable-renderer-backgrounding ^
  --disable-backgrounding-occluded-windows ^
  --allow-running-insecure-content ^
  --disable-site-isolation-trials ^
  --disable-features=TranslateUI ^
  --disable-ipc-flooding-protection ^
  https://localhost:5174

echo.
echo ✅ Chrome iniciado para WebRTC
echo 🌐 Abre: https://localhost:5174
echo.
pause
