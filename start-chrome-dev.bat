@echo off
echo 🚀 Iniciando Chrome para desarrollo WebRTC...
echo.
echo ⚠️  ADVERTENCIA: Este perfil de Chrome está configurado para desarrollo
echo    - Deshabilita verificaciones de seguridad
echo    - Solo usar para desarrollo local
echo    - NO usar para navegación normal
echo.

REM Crear directorio para perfil de desarrollo si no existe
if not exist "C:\temp\chrome_dev" mkdir "C:\temp\chrome_dev"

REM Iniciar Chrome con flags especiales
"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --allow-running-insecure-content ^
  --disable-web-security ^
  --user-data-dir="C:\temp\chrome_dev" ^
  --ignore-certificate-errors ^
  --ignore-ssl-errors ^
  --allow-insecure-localhost ^
  --enable-features=WebRTC ^
  --disable-features=VizDisplayCompositor ^
  --enable-webrtc-stun-origin ^
  --disable-background-timer-throttling ^
  --disable-renderer-backgrounding ^
  --disable-backgrounding-occluded-windows ^
  https://localhost:5174

echo.
echo ✅ Chrome iniciado con configuración de desarrollo
echo 🌐 Abre: https://localhost:5174
echo.
pause
