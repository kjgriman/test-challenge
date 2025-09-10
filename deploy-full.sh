#!/bin/bash

# Script de despliegue completo
echo "🚀 Desplegando Sistema Completo de Videoconferencias..."

# Generar certificados SSL
echo "🔐 Generando certificados SSL..."
chmod +x generate-ssl.sh
./generate-ssl.sh

# Configurar variables de entorno
echo "⚙️ Configurando variables de entorno..."
echo "USE_HTTPS=true" >> backend/.env
echo "FRONTEND_URL=https://localhost:5173" >> backend/.env
echo "CORS_ORIGIN=https://localhost:5173" >> backend/.env
echo "SOCKET_CORS_ORIGIN=https://localhost:5173" >> backend/.env

# Instalar dependencias
echo "📦 Instalando dependencias del backend..."
cd backend && npm install

echo "📦 Instalando dependencias del frontend..."
cd ../frontend && npm install

# Construir frontend
echo "🏗️ Construyendo frontend..."
npm run build

# Volver al directorio raíz
cd ..

echo "✅ Sistema desplegado completamente!"
echo ""
echo "🎯 Para iniciar el sistema:"
echo "   1. Terminal 1: cd backend && npm run dev"
echo "   2. Terminal 2: cd frontend && npm run dev"
echo ""
echo "🌐 URLs del sistema:"
echo "   Frontend: https://localhost:5173"
echo "   Backend: https://localhost:3001"
echo "   Videoconferencias: https://localhost:5173/full-video-conference"
echo ""
echo "🔒 Sistema configurado con HTTPS para WebRTC completo"
