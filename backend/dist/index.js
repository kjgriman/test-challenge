"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
var express = require('express');
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var cors = require('cors');
var helmet = require('helmet');
var dotenv = require('dotenv');
var mongoose_1 = require("mongoose");
// Importar rutas y middleware
var auth_1 = require("./routes/auth");
var dashboard_1 = require("./routes/dashboard");
// import userRoutes from './routes/users';
var sessions_1 = require("./routes/sessions");
var students_1 = require("./routes/students");
var video_1 = require("./routes/video");
var videoRooms_1 = require("./routes/videoRooms");
var notifications_1 = require("./routes/notifications");
// import gameRoutes from './routes/games';
var socketHandlers_1 = require("./sockets/socketHandlers");
var videoSocketHandler_1 = require("./sockets/videoSocketHandler");
// import { Game } from './models/Game'; // Temporarily disabled due to TypeScript errors
var errorHandler_1 = require("./middleware/errorHandler");
var rateLimiter_1 = require("./middleware/rateLimiter");
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
var app = express();
exports.app = app;
var server = (0, http_1.createServer)(app);
var socketCorsOrigin = process.env['FRONTEND_URL'] || process.env['VERCEL_URL'] || "https://test-challenge-ul34.vercel.app" || "http://localhost:5173";
console.log('🔌 WebSocket CORS Configuration:', {
    socketCorsOrigin: socketCorsOrigin,
    methods: ["GET", "POST", "OPTIONS"]
});
var io = new socket_io_1.Server(server, {
    cors: {
        origin: socketCorsOrigin,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
        credentials: true
    }
});
exports.io = io;
var PORT = process.env['PORT'] || 3001;
var MONGODB_URI = process.env['MONGODB_URI'] || 'mongodb://127.0.0.1:27017/speech-therapy';
// Para desarrollo sin MongoDB, usar base de datos en memoria
var USE_IN_MEMORY_DB = process.env['NODE_ENV'] === 'development' && !process.env['MONGODB_URI'];
// Middleware de seguridad y parsing
app.use(helmet());
// Configuración de CORS más permisiva para desarrollo
var corsOrigin = process.env['FRONTEND_URL'] || process.env['VERCEL_URL'] || "https://test-challenge-ul34.vercel.app" || "http://localhost:5173";
console.log('🔧 CORS Configuration:', {
    FRONTEND_URL: process.env['FRONTEND_URL'],
    VERCEL_URL: process.env['VERCEL_URL'],
    corsOrigin: corsOrigin,
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
app.use(function (req, res, next) {
    var requestOrigin = req.headers.origin;
    var allowedOrigin = process.env['FRONTEND_URL'] || process.env['VERCEL_URL'] || "https://test-challenge-ul34.vercel.app" || "http://localhost:5173";
    console.log('🌐 CORS Request:', {
        method: req.method,
        path: req.path,
        origin: requestOrigin,
        allowedOrigin: allowedOrigin,
        userAgent: req.get('User-Agent')
    });
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        console.log('✅ Preflight OPTIONS request handled');
        res.sendStatus(200);
    }
    else {
        next();
    }
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Rate limiting para prevenir abuso (solo en producción)
if (process.env['NODE_ENV'] !== 'development') {
    app.use(rateLimiter_1.rateLimiter);
}
// Logging middleware para debugging
app.use(function (req, _res, next) {
    console.log("".concat(new Date().toISOString(), " - ").concat(req.method, " ").concat(req.path));
    next();
});
// Rutas de la API
app.use('/api/auth', auth_1.default);
app.use('/api/dashboard', dashboard_1.default);
// app.use('/api/users', userRoutes);
app.use('/api/sessions', sessions_1.default);
app.use('/api/students', students_1.default);
app.use('/api/video', video_1.default);
app.use('/api/video-rooms', videoRooms_1.default);
app.use('/api/notifications', notifications_1.default);
// app.use('/api/games', gameRoutes);
// Health check endpoint
app.get('/health', function (_req, res) {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Configurar Socket.io handlers
(0, socketHandlers_1.setupSocketHandlers)(io);
// Configurar Video Socket Handler
var videoSocketHandler = new videoSocketHandler_1.VideoSocketHandler(server);
// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler_1.errorHandler);
// Manejo de rutas no encontradas
app.use('*', function (req, res) {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl
    });
});
// Función para iniciar el servidor
var startServer = function () {
    server.listen(Number(PORT), '0.0.0.0', function () {
        console.log("\uD83D\uDE80 Servidor ejecut\u00E1ndose en puerto ".concat(PORT));
        console.log("\uD83D\uDCE1 WebSocket disponible en ws://0.0.0.0:".concat(PORT));
        console.log("\uD83C\uDF10 API disponible en http://0.0.0.0:".concat(PORT, "/api"));
        console.log("\uD83C\uDF0D Entorno: ".concat(process.env['NODE_ENV'] || 'development'));
    });
};
// Conectar a MongoDB o usar base de datos en memoria
if (USE_IN_MEMORY_DB) {
    console.log('⚠️  Usando base de datos en memoria para desarrollo');
    startServer();
}
else {
    mongoose_1.default.connect(MONGODB_URI, {
        family: 4, // Forzar IPv4
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
        .then(function () {
        console.log('✅ Conectado a MongoDB');
        startServer();
    })
        .catch(function (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        console.log('💡 Para desarrollo sin MongoDB, establece NODE_ENV=development');
        process.exit(1);
    });
}
// Manejo graceful de cierre
process.on('SIGTERM', function () {
    console.log('🔄 Recibido SIGTERM, cerrando servidor...');
    server.close(function () {
        console.log('✅ Servidor cerrado');
        mongoose_1.default.connection.close();
        process.exit(0);
    });
});
process.on('SIGINT', function () {
    console.log('🔄 Recibido SIGINT, cerrando servidor...');
    server.close(function () {
        console.log('✅ Servidor cerrado');
        mongoose_1.default.connection.close();
        process.exit(0);
    });
});
