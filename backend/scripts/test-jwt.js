const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('🔍 Verificando configuración JWT...');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'CONFIGURED' : 'NOT_SET');
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || '24h');

// Probar generar un token
const testPayload = {
  userId: '68a7d2300340a0d24405e849',
  email: 'test@test.com',
  role: 'slp'
};

try {
  const token = jwt.sign(testPayload, process.env.JWT_SECRET || 'your-secret-key', { 
    expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
  });
  
  console.log('✅ Token generado exitosamente');
  console.log('Token:', token.substring(0, 50) + '...');
  
  // Probar verificar el token
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  console.log('✅ Token verificado exitosamente');
  console.log('Decoded payload:', decoded);
  
} catch (error) {
  console.error('❌ Error con JWT:', error.message);
}
