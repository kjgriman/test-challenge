#!/bin/bash

# Script para generar certificados SSL para desarrollo
echo "🔐 Generando certificados SSL para desarrollo..."

# Crear directorio ssl si no existe
mkdir -p ssl

# Generar clave privada
openssl genrsa -out ssl/private-key.pem 2048

# Generar certificado autofirmado
openssl req -new -x509 -key ssl/private-key.pem -out ssl/certificate.pem -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

echo "✅ Certificados SSL generados:"
echo "   - ssl/private-key.pem"
echo "   - ssl/certificate.pem"
echo ""
echo "🚀 Ahora puedes usar HTTPS en desarrollo"
echo "   Frontend: https://localhost:5173"
echo "   Backend: https://localhost:3001"
