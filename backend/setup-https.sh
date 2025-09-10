#!/bin/bash

# Script para configurar HTTPS en desarrollo

echo "🔒 Configurando HTTPS para desarrollo local..."

# Crear archivo .env con configuración HTTPS
cat > .env << 'EOF'
# 🚀 Configuración del Backend - Variables de Entorno

# Base de datos MongoDB
MONGODB_URI=mongodb+srv://kjgriman:test123@cluster0.mongodb.net/speech-therapy?retryWrites=true&w=majority

# Autenticación JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Configuración del servidor
PORT=3001
NODE_ENV=development
USE_HTTPS=true

# URLs de la aplicación
FRONTEND_URL=https://localhost:5173
BACKEND_URL=https://localhost:3001

# Configuración de CORS
CORS_ORIGIN=https://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug

# Configuración de WebSockets
SOCKET_CORS_ORIGIN=https://localhost:5173

# Configuración de seguridad
BCRYPT_ROUNDS=12

# Configuración de sesiones (si usas express-session)
SESSION_SECRET=your-session-secret-key

# Configuración de archivos (si implementas uploads)
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Configuración de email (si implementas notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Configuración de IA (para resúmenes automáticos)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo

# Configuración de videollamadas (si usas servicios externos)
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate

# Configuración de monitoreo (opcional)
SENTRY_DSN=your-sentry-dsn
EOF

echo "✅ Archivo .env configurado con HTTPS"
echo "🔒 Certificados SSL ya generados"
echo "🚀 Listo para ejecutar con HTTPS"
