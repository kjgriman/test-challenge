const express = require('express');
import { createServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { Server } from 'socket.io';
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// Importar rutas y middleware
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import sessionRoutes from './routes/sessions';
import studentRoutes from './routes/students';
import videoRoomRoutes from './routes/videoRooms';
import evaluationRoutes from './routes/evaluations';
import notificationRoutes from './routes/notifications';
import passwordRoutes from './routes/password';
import { setupSocketHandlers } from './sockets/socketHandlers';
import { VideoSocketHandler } from './sockets/videoSocketHandler';
import { setupVideoRoomHandlers } from './sockets/videoRoomHandlers';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Cargar variables de entorno
dotenv.config();

// Configuración del servidor
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://localhost:5173';
const VERCEL_URL = process.env.VERCEL_URL;
const corsOrigin = VERCEL_URL ? `https://${VERCEL_URL}` : FRONTEND_URL;
const socketCorsOrigin = VERCEL_URL ? `https://${VERCEL_URL}` : FRONTEND_URL;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

console.log('📋 Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT,
  FRONTEND_URL,
  VERCEL_URL,
  MONGODB_URI: process.env.MONGODB_URI ? '***CONFIGURED***' : 'NOT SET',
  USE_HTTPS
});

// Configuración CORS
const corsOptions = {
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

console.log('🔧 CORS Configuration:', {
  FRONTEND_URL,
  VERCEL_URL,
  corsOrigin,
  NODE_ENV: process.env.NODE_ENV
});

// Crear aplicación Express
const app = express();

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
      mediaSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);

// Rutas de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    https: USE_HTTPS
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/video-rooms', videoRoomRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/password', passwordRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

// Configuración de MongoDB
const connectToMongoDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Conectado a MongoDB');
    } else {
      console.log('⚠️ MONGODB_URI no configurado, usando base de datos en memoria');
    }
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    console.log('💡 Para desarrollo sin MongoDB, establece NODE_ENV=development');
  }
};

// Conectar a MongoDB
connectToMongoDB();

// Crear servidor HTTP o HTTPS
let server;
if (USE_HTTPS) {
  try {
    // Configuración SSL para producción
    const sslOptions = {
      key: fs.readFileSync(path.join(__dirname, '../ssl/private-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '../ssl/certificate.pem'))
    };
    
    server = createHttpsServer(sslOptions, app);
    console.log('🔒 Servidor HTTPS configurado');
  } catch (error) {
    console.error('❌ Error configurando HTTPS:', error);
    console.log('🔄 Usando HTTP como fallback');
    server = createServer(app);
  }
} else {
  server = createServer(app);
  console.log('🌐 Servidor HTTP configurado');
}

// Configuración de Socket.IO
const io = new Server(server, {
  cors: {
    origin: socketCorsOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

console.log('🔌 WebSocket CORS Configuration:', {
  socketCorsOrigin,
  methods: ['GET', 'POST', 'OPTIONS']
});

// Configurar handlers de Socket.IO
setupSocketHandlers(io);
setupVideoRoomHandlers(io);

// Configurar VideoSocketHandler
const videoSocketHandler = new VideoSocketHandler(io);

console.log('🔌 WebSocket handlers configurados');

// Iniciar servidor
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📡 WebSocket disponible en ${USE_HTTPS ? 'wss' : 'ws'}://0.0.0.0:${PORT}`);
  console.log(`🌐 API disponible en ${USE_HTTPS ? 'https' : 'http'}://0.0.0.0:${PORT}/api`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
  console.log(`🔒 HTTPS: ${USE_HTTPS ? 'Habilitado' : 'Deshabilitado'}`);
});

// Manejo de errores del servidor
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} ya está en uso`);
    console.log('💡 Intenta cambiar el puerto o detener el proceso que lo está usando');
  } else {
    console.error('❌ Error del servidor:', error);
  }
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    mongoose.connection.close();
    process.exit(0);
  });
});

export default app;