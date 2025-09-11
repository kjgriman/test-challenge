@echo off
echo 🚀 Iniciando Edge para WebRTC...
echo.

REM Cerrar Edge existente
taskkill //F //IM msedge.exe 2>nul

REM Iniciar Edge con flags para WebRTC
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" ^
  --user-data-dir="C:\temp\edge_webrtc" ^
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
  --enable-webrtc-hw-decoding ^
  --enable-webrtc-hw-encoding ^
  --enable-webrtc-stun-origin ^
  --enable-webrtc-hw-vp8-encoding ^
  --enable-webrtc-hw-vp9-encoding ^
  --enable-webrtc-hw-h264-encoding ^
  --enable-webrtc-hw-h264-decoding ^
  --enable-webrtc-hw-vp8-decoding ^
  --enable-webrtc-hw-vp9-decoding ^
  https://localhost:5174

echo.
echo ✅ Edge iniciado para WebRTC
echo 🌐 Abre: https://localhost:5174
echo.
pause
