#!/bin/bash

# Script para configurar MongoDB Atlas
echo "🔧 Configurando MongoDB Atlas..."

# Crear archivo .env con MongoDB Atlas
cat > .env << 'EOF'
# 🚀 Configuración del Backend - Variables de Entorno

# Base de datos MongoDB Atlas
MONGODB_URI=mongodb+srv://test:test123@cluster0.mongodb.net/speech-therapy-platform?retryWrites=true&w=majority

# Autenticación JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Configuración del servidor
PORT=3001
NODE_ENV=development

# URLs de la aplicación
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001

# Configuración de CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug

# Configuración de WebSockets
SOCKET_CORS_ORIGIN=http://localhost:5173

# Configuración de seguridad
BCRYPT_ROUNDS=12

# Configuración de sesiones
SESSION_SECRET=your-session-secret-key

# Configuración de archivos
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Configuración de email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Configuración de IA
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo

# Configuración de videollamadas
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate

# Configuración de monitoreo
SENTRY_DSN=your-sentry-dsn
EOF

echo "✅ Archivo .env configurado con MongoDB Atlas"
echo "📋 Variables configuradas:"
echo "   - MONGODB_URI: MongoDB Atlas"
echo "   - NODE_ENV: development"
echo "   - PORT: 3001"
echo "   - FRONTEND_URL: http://localhost:5173"
echo ""
echo "⚠️  IMPORTANTE: Necesitas configurar tu propia URI de MongoDB Atlas"
echo "   Reemplaza 'test:test123@cluster0.mongodb.net' con tus credenciales reales"
