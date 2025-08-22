"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
// Importar rutas y middleware
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
// import userRoutes from './routes/users';
const sessions_1 = __importDefault(require("./routes/sessions"));
const students_1 = __importDefault(require("./routes/students"));
// import gameRoutes from './routes/games';
const socketHandlers_1 = require("./sockets/socketHandlers");
// import { Game } from './models/Game'; // Temporarily disabled due to TypeScript errors
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
// Cargar variables de entorno
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env['FRONTEND_URL'] || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});
exports.io = io;
const PORT = process.env['PORT'] || 3001;
const MONGODB_URI = process.env['MONGODB_URI'] || 'mongodb://127.0.0.1:27017/speech-therapy';
// Para desarrollo sin MongoDB, usar base de datos en memoria
const USE_IN_MEMORY_DB = process.env['NODE_ENV'] === 'development' && !process.env['MONGODB_URI'];
// Middleware de seguridad y parsing
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env['FRONTEND_URL'] || "http://localhost:5173",
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Rate limiting para prevenir abuso
app.use(rateLimiter_1.rateLimiter);
// Logging middleware para debugging
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Rutas de la API
app.use('/api/auth', auth_1.default);
app.use('/api/dashboard', dashboard_1.default);
// app.use('/api/users', userRoutes);
app.use('/api/sessions', sessions_1.default);
app.use('/api/students', students_1.default);
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
(0, socketHandlers_1.setupSocketHandlers)(io);
// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler_1.errorHandler);
// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl
    });
});
// Función para iniciar el servidor
const startServer = () => {
    server.listen(PORT, () => {
        console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
        console.log(`📡 WebSocket disponible en ws://localhost:${PORT}`);
        console.log(`🌐 API disponible en http://localhost:${PORT}/api`);
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
        mongoose_1.default.connection.close();
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('🔄 Recibido SIGINT, cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado');
        mongoose_1.default.connection.close();
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map