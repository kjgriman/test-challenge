// Script para iniciar el backend en desarrollo
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/speech-therapy';
process.env.NODE_ENV = 'development';
process.env.PORT = '3001';
process.env.FRONTEND_URL = 'http://localhost:5174';

// Ejecutar el servidor
require('ts-node-dev/lib/bin.js').run(['--respawn', '--transpile-only', 'src/index.ts']);
