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
var videoRooms_1 = require("./routes/videoRooms");
// import gameRoutes from './routes/games';
var socketHandlers_1 = require("./sockets/socketHandlers");
// import { Game } from './models/Game'; // Temporarily disabled due to TypeScript errors
var errorHandler_1 = require("./middleware/errorHandler");
var rateLimiter_1 = require("./middleware/rateLimiter");
// Cargar variables de entorno
dotenv.config();
var app = express();
exports.app = app;
var server = (0, http_1.createServer)(app);
var io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env['FRONTEND_URL'] || process.env['VERCEL_URL'] || "http://localhost:5173",
        methods: ["GET", "POST"],
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
app.use(cors({
    origin: process.env['FRONTEND_URL'] || process.env['VERCEL_URL'] || "http://localhost:5173",
    credentials: true
}));
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
app.use('/api/video-rooms', videoRooms_1.default);
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
