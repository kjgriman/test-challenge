"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var http_1 = require("http");
var https_1 = require("https");
var socket_io_1 = require("socket.io");
var cors = require('cors');
var helmet = require('helmet');
var dotenv = require('dotenv');
var mongoose_1 = require("mongoose");
var fs = require("fs");
var path = require("path");
// Importar rutas y middleware
var auth_1 = require("./routes/auth");
var dashboard_1 = require("./routes/dashboard");
var sessions_1 = require("./routes/sessions");
var students_1 = require("./routes/students");
var videoRooms_1 = require("./routes/videoRooms");
var evaluations_1 = require("./routes/evaluations");
var notifications_1 = require("./routes/notifications");
var password_1 = require("./routes/password");
var games_1 = require("./routes/games");
var socketHandlers_1 = require("./sockets/socketHandlers");
var videoSocketHandler_1 = require("./sockets/videoSocketHandler");
var videoRoomHandlers_1 = require("./sockets/videoRoomHandlers");
var gameSocketHandler_1 = require("./sockets/gameSocketHandler");
var errorHandler_1 = require("./middleware/errorHandler");
var rateLimiter_1 = require("./middleware/rateLimiter");
// Cargar variables de entorno
dotenv.config();
// Configuración del servidor
var PORT = process.env.PORT || 3001;
var FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
var VERCEL_URL = process.env.VERCEL_URL;
var corsOrigin = VERCEL_URL ? "https://".concat(VERCEL_URL) : FRONTEND_URL;
var socketCorsOrigin = VERCEL_URL ? "https://".concat(VERCEL_URL) : FRONTEND_URL;
var USE_HTTPS = true; // Habilitar HTTPS para desarrollo local
console.log('📋 Environment Variables:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: PORT,
    FRONTEND_URL: FRONTEND_URL,
    VERCEL_URL: VERCEL_URL,
    MONGODB_URI: process.env.MONGODB_URI ? '***CONFIGURED***' : 'NOT SET',
    USE_HTTPS: USE_HTTPS
});
// Configuración CORS
var corsOptions = {
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
console.log('🔧 CORS Configuration:', {
    FRONTEND_URL: FRONTEND_URL,
    VERCEL_URL: VERCEL_URL,
    corsOrigin: corsOrigin,
    NODE_ENV: process.env.NODE_ENV
});
// Crear aplicación Express
var app = express();
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
app.use(rateLimiter_1.rateLimiter);
// Rutas de salud
app.get('/health', function (req, res) {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        https: USE_HTTPS
    });
});
// Rutas de la API
app.use('/api/auth', auth_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/sessions', sessions_1.default);
app.use('/api/students', students_1.default);
app.use('/api/video-rooms', videoRooms_1.default);
app.use('/api/evaluations', evaluations_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/password', password_1.default);
app.use('/api/games', games_1.default);
// Middleware de manejo de errores
app.use(errorHandler_1.errorHandler);
// Configuración de MongoDB
var connectToMongoDB = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                if (!process.env.MONGODB_URI) return [3 /*break*/, 2];
                return [4 /*yield*/, mongoose_1.default.connect(process.env.MONGODB_URI)];
            case 1:
                _a.sent();
                console.log('✅ Conectado a MongoDB');
                return [3 /*break*/, 3];
            case 2:
                console.log('⚠️ MONGODB_URI no configurado, usando base de datos en memoria');
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error('❌ Error conectando a MongoDB:', error_1);
                console.log('💡 Para desarrollo sin MongoDB, establece NODE_ENV=development');
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
// Conectar a MongoDB
connectToMongoDB();
// Crear servidor HTTP o HTTPS
var server;
if (USE_HTTPS) {
    try {
        // Configuración SSL para producción
        var sslOptions = {
            key: fs.readFileSync(path.join(__dirname, '../ssl/private-key.pem')),
            cert: fs.readFileSync(path.join(__dirname, '../ssl/certificate.pem'))
        };
        server = (0, https_1.createServer)(sslOptions, app);
        console.log('🔒 Servidor HTTPS configurado');
    }
    catch (error) {
        console.error('❌ Error configurando HTTPS:', error);
        console.log('🔄 Usando HTTP como fallback');
        server = (0, http_1.createServer)(app);
    }
}
else {
    server = (0, http_1.createServer)(app);
    console.log('🌐 Servidor HTTP configurado');
}
// Configuración de Socket.IO
var io = new socket_io_1.Server(server, {
    cors: {
        origin: socketCorsOrigin,
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});
console.log('🔌 WebSocket CORS Configuration:', {
    socketCorsOrigin: socketCorsOrigin,
    methods: ['GET', 'POST', 'OPTIONS']
});
// Configurar handlers de Socket.IO
(0, socketHandlers_1.setupSocketHandlers)(io);
(0, videoRoomHandlers_1.setupVideoRoomHandlers)(io);
// Configurar VideoSocketHandler
var videoSocketHandler = new videoSocketHandler_1.VideoSocketHandler(io);
// Configurar GameSocketHandler
var gameSocketHandler = new gameSocketHandler_1.GameSocketHandler(io);
console.log('🔌 WebSocket handlers configurados');
// Iniciar servidor
server.listen(PORT, '0.0.0.0', function () {
    console.log("\uD83D\uDE80 Servidor ejecut\u00E1ndose en puerto ".concat(PORT));
    console.log("\uD83D\uDCE1 WebSocket disponible en ".concat(USE_HTTPS ? 'wss' : 'ws', "://0.0.0.0:").concat(PORT));
    console.log("\uD83C\uDF10 API disponible en ".concat(USE_HTTPS ? 'https' : 'http', "://0.0.0.0:").concat(PORT, "/api"));
    console.log("\uD83C\uDF0D Entorno: ".concat(process.env.NODE_ENV));
    console.log("\uD83D\uDD12 HTTPS: ".concat(USE_HTTPS ? 'Habilitado' : 'Deshabilitado'));
});
// Manejo de errores del servidor
server.on('error', function (error) {
    if (error.code === 'EADDRINUSE') {
        console.error("\u274C Puerto ".concat(PORT, " ya est\u00E1 en uso"));
        console.log('💡 Intenta cambiar el puerto o detener el proceso que lo está usando');
    }
    else {
        console.error('❌ Error del servidor:', error);
    }
});
// Manejo de cierre graceful
process.on('SIGTERM', function () {
    console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
    server.close(function () {
        console.log('✅ Servidor cerrado');
        mongoose_1.default.connection.close();
        process.exit(0);
    });
});
process.on('SIGINT', function () {
    console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
    server.close(function () {
        console.log('✅ Servidor cerrado');
        mongoose_1.default.connection.close();
        process.exit(0);
    });
});
exports.default = app;
