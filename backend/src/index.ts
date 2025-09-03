const express = require('express');
import { createServer } from 'http';
import { Server } from 'socket.io';
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
import mongoose from 'mongoose';

// Importar rutas y middleware
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
// import userRoutes from './routes/users';
import sessionRoutes from './routes/sessions';
import studentRoutes from './routes/students';
import videoRoutes from './routes/video';
import videoRoomRoutes from './routes/videoRooms';
import notificationRoutes from './routes/notifications';
// import gameRoutes from './routes/games';
import { setupSocketHandlers } from './sockets/socketHandlers';
import { VideoSocketHandler } from './sockets/videoSocketHandler';
// import { Game } from './models/Game'; // Temporarily disabled due to TypeScript errors
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Cargar variables de entorno
dotenv.config();

// Log de todas las variables de entorno relevantes
console.log('📋 Environment Variables:', {
  NODE_ENV: process.env['NODE_ENV'],
  PORT: process.env['PORT'],
  FRONTEND_URL: process.env['FRONTEND_URL'],
  VERCEL_URL: process.env['VERCEL_URL'],
  MONGODB_URI: process.env['MONGODB_URI'] ? '***CONFIGURED***' : 'NOT_SET'
});

const app = express();
const server = createServer(app);
const socketCorsOrigin = process.env['FRONTEND_URL'] || process.env['VERCEL_URL'] || "https://test-challenge-ul34.vercel.app" || "http://localhost:5173";

console.log('🔌 WebSocket CORS Configuration:', {
  socketCorsOrigin,
  methods: ["GET", "POST", "OPTIONS"]
});

const io = new Server(server, {
  cors: {
    origin: socketCorsOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    credentials: true
  }
});

const PORT = process.env['PORT'] || 3001;
const MONGODB_URI = process.env['MONGODB_URI'] || 'mongodb://127.0.0.1:27017/speech-therapy';

// Para desarrollo sin MongoDB, usar base de datos en memoria
const USE_IN_MEMORY_DB = process.env['NODE_ENV'] === 'development' && !process.env['MONGODB_URI'];

// Middleware de seguridad y parsing
app.use(helmet());

// Configuración de CORS más permisiva para desarrollo
const corsOrigin = process.env['FRONTEND_URL'] || process.env['VERCEL_URL'] || "https://test-challenge-ul34.vercel.app" || "http://localhost:5173";

console.log('🔧 CORS Configuration:', {
  FRONTEND_URL: process.env['FRONTEND_URL'],
  VERCEL_URL: process.env['VERCEL_URL'],
  corsOrigin,
  NODE_ENV: process.env['NODE_ENV']
});

app.use(cors({
  origin: corsOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware adicional para manejar preflight OPTIONS
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  const allowedOrigin = process.env['FRONTEND_URL'] || process.env['VERCEL_URL'] || "https://test-challenge-ul34.vercel.app" || "http://localhost:5173";
  
  console.log('🌐 CORS Request:', {
    method: req.method,
    path: req.path,
    origin: requestOrigin,
    allowedOrigin,
    userAgent: req.get('User-Agent')
  });
  
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Preflight OPTIONS request handled');
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting para prevenir abuso (solo en producción)
if (process.env['NODE_ENV'] !== 'development') {
  app.use(rateLimiter);
}

// Logging middleware para debugging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/video-rooms', videoRoomRoutes);
app.use('/api/notifications', notificationRoutes);
// app.use('/api/games', gameRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Configurar Socket.io handlers
setupSocketHandlers(io);

// Configurar Video Socket Handler
const videoSocketHandler = new VideoSocketHandler(server);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// Función para iniciar el servidor
const startServer = () => {
  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📡 WebSocket disponible en ws://0.0.0.0:${PORT}`);
    console.log(`🌐 API disponible en http://0.0.0.0:${PORT}/api`);
    console.log(`🌍 Entorno: ${process.env['NODE_ENV'] || 'development'}`);
  });
};

// Conectar a MongoDB o usar base de datos en memoria
if (USE_IN_MEMORY_DB) {
  console.log('⚠️  Usando base de datos en memoria para desarrollo');
  startServer();
} else {
  mongoose.connect(MONGODB_URI, {
    family: 4, // Forzar IPv4
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
    .then(() => {
      console.log('✅ Conectado a MongoDB');
      startServer();
    })
    .catch((error) => {
      console.error('❌ Error conectando a MongoDB:', error);
      console.log('💡 Para desarrollo sin MongoDB, establece NODE_ENV=development');
      process.exit(1);
    });
}

// Manejo graceful de cierre
process.on('SIGTERM', () => {
  console.log('🔄 Recibido SIGTERM, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Recibido SIGINT, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    mongoose.connection.close();
    process.exit(0);
  });
});

export { app, io };

