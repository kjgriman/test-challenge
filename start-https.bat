@echo off
echo 🚀 Iniciando aplicación con HTTPS para WebRTC...

echo 📡 Iniciando proxy HTTPS para frontend...
start "Frontend HTTPS" cmd /k "local-ssl-proxy --source 5174 --target 5173"

echo 🔌 Iniciando proxy HTTPS para backend...
start "Backend HTTPS" cmd /k "local-ssl-proxy --source 3001 --target 3001"

echo ✅ Proxies HTTPS iniciados!
echo.
echo 🌐 URLs HTTPS:
echo    Frontend: https://localhost:5174
echo    Backend:  https://localhost:3001
echo.
echo ⚠️  Acepta los certificados SSL cuando el navegador los solicite
echo.
echo 📝 NOTA: El backend debe estar ejecutándose en puerto 3001
echo.
pause
