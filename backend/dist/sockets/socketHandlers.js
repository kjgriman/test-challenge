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
exports.setupSocketHandlers = void 0;
var TherapySession_1 = require("../models/TherapySession");
var User_1 = require("../models/User");
var jwt = require("jsonwebtoken");
var gameHandlers_1 = require("./gameHandlers");
// Almacenar estados de juegos activos
var activeGames = new Map();
// Almacenar conexiones de usuarios por sesión
var sessionConnections = new Map();
// Autenticar socket
var authenticateSocket = function (socket, token) { return __awaiter(void 0, void 0, void 0, function () {
    var decoded, user, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'your-secret-key');
                return [4 /*yield*/, User_1.User.findById(decoded.userId)];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, false];
                }
                socket.userId = user._id.toString();
                socket.userRole = user.role;
                return [2 /*return*/, true];
            case 2:
                error_1 = _a.sent();
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Verificar permisos de sesión
var verifySessionAccess = function (socket, sessionId) { return __awaiter(void 0, void 0, void 0, function () {
    var session, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, TherapySession_1.TherapySession.findById(sessionId)];
            case 1:
                session = _a.sent();
                if (!session)
                    return [2 /*return*/, false];
                if (socket.userRole === 'slp') {
                    return [2 /*return*/, session.slpId.toString() === socket.userId];
                }
                else {
                    return [2 /*return*/, session.childId.toString() === socket.userId];
                }
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Configurar manejadores de WebSocket
var setupSocketHandlers = function (io) {
    // Configurar handlers de juegos
    var gameHandlers = new gameHandlers_1.default(io);
    gameHandlers.initialize();
    // Middleware de autenticación
    io.use(function (socket, next) { return __awaiter(void 0, void 0, void 0, function () {
        var token, isAuthenticated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = socket.handshake.auth['token'];
                    if (!token) {
                        return [2 /*return*/, next(new Error('Token no proporcionado'))];
                    }
                    return [4 /*yield*/, authenticateSocket(socket, token)];
                case 1:
                    isAuthenticated = _a.sent();
                    if (!isAuthenticated) {
                        return [2 /*return*/, next(new Error('Token inválido'))];
                    }
                    next();
                    return [2 /*return*/];
            }
        });
    }); });
    // Conexión de socket
    io.on('connection', function (socket) {
        console.log("\uD83D\uDD0C Usuario conectado: ".concat(socket.userId, " (").concat(socket.userRole, ")"));
        // Unirse a sesión
        socket.on('join-session', function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
            var hasAccess, gameState, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, verifySessionAccess(socket, sessionId)];
                    case 1:
                        hasAccess = _a.sent();
                        if (!hasAccess) {
                            socket.emit('error', { message: 'No tienes permisos para esta sesión' });
                            return [2 /*return*/];
                        }
                        // Unirse al room de la sesión
                        socket.join("session:".concat(sessionId));
                        socket.sessionId = sessionId;
                        // Registrar conexión
                        if (!sessionConnections.has(sessionId)) {
                            sessionConnections.set(sessionId, new Set());
                        }
                        sessionConnections.get(sessionId).add(socket.userId);
                        // Notificar a otros participantes
                        socket.to("session:".concat(sessionId)).emit('user-joined', {
                            userId: socket.userId,
                            userRole: socket.userRole,
                            timestamp: new Date().toISOString()
                        });
                        gameState = activeGames.get(sessionId);
                        if (gameState) {
                            socket.emit('game-state', gameState);
                        }
                        console.log("\uD83D\uDC65 Usuario ".concat(socket.userId, " se uni\u00F3 a la sesi\u00F3n ").concat(sessionId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        socket.emit('error', { message: 'Error al unirse a la sesión' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        // Salir de sesión
        socket.on('leave-session', function (sessionId) {
            socket.leave("session:".concat(sessionId));
            // Remover de conexiones
            var connections = sessionConnections.get(sessionId);
            if (connections) {
                connections.delete(socket.userId);
                if (connections.size === 0) {
                    sessionConnections.delete(sessionId);
                }
            }
            // Notificar a otros participantes
            socket.to("session:".concat(sessionId)).emit('user-left', {
                userId: socket.userId,
                userRole: socket.userRole,
                timestamp: new Date().toISOString()
            });
            console.log("\uD83D\uDC4B Usuario ".concat(socket.userId, " sali\u00F3 de la sesi\u00F3n ").concat(sessionId));
        });
        // Iniciar juego
        socket.on('start-game', function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var hasAccess, gameState, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, verifySessionAccess(socket, data.sessionId)];
                    case 1:
                        hasAccess = _a.sent();
                        if (!hasAccess || socket.userRole !== 'slp') {
                            socket.emit('error', { message: 'No tienes permisos para iniciar el juego' });
                            return [2 /*return*/];
                        }
                        gameState = {
                            sessionId: data.sessionId,
                            gameType: data.gameType,
                            currentLevel: data.level,
                            score: 0,
                            accuracy: 0,
                            timeRemaining: 300, // 5 minutos
                            isActive: true
                        };
                        activeGames.set(data.sessionId, gameState);
                        // Notificar a todos los participantes
                        io.to("session:".concat(data.sessionId)).emit('game-started', gameState);
                        console.log("\uD83C\uDFAE Juego iniciado en sesi\u00F3n ".concat(data.sessionId, ": ").concat(data.gameType));
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        socket.emit('error', { message: 'Error al iniciar el juego' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        // Acción de juego
        socket.on('game-action', function (action) {
            var gameState = activeGames.get(socket.sessionId);
            if (!gameState || !gameState.isActive) {
                socket.emit('error', { message: 'No hay juego activo' });
                return;
            }
            // Procesar acción según el tipo
            switch (action.type) {
                case 'correct-answer':
                    gameState.score += 10;
                    gameState.accuracy = ((gameState.accuracy * 0.9) + 100) / 2;
                    break;
                case 'incorrect-answer':
                    gameState.accuracy = ((gameState.accuracy * 0.9) + 0) / 2;
                    break;
                case 'level-complete':
                    gameState.currentLevel++;
                    gameState.score += 50;
                    break;
                case 'time-update':
                    gameState.timeRemaining = action.data.timeRemaining;
                    break;
            }
            // Sincronizar con todos los participantes
            io.to("session:".concat(socket.sessionId)).emit('game-update', {
                action: action,
                gameState: gameState,
                timestamp: new Date().toISOString()
            });
            console.log("\uD83C\uDFAF Acci\u00F3n de juego: ".concat(action.type, " en sesi\u00F3n ").concat(socket.sessionId));
        });
        // Finalizar juego
        socket.on('end-game', function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var hasAccess, gameState, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, verifySessionAccess(socket, data.sessionId)];
                    case 1:
                        hasAccess = _a.sent();
                        if (!hasAccess || socket.userRole !== 'slp') {
                            socket.emit('error', { message: 'No tienes permisos para finalizar el juego' });
                            return [2 /*return*/];
                        }
                        gameState = activeGames.get(data.sessionId);
                        if (!gameState) return [3 /*break*/, 3];
                        gameState.isActive = false;
                        gameState.score = data.finalScore;
                        gameState.accuracy = data.finalAccuracy;
                        // Actualizar sesión en la base de datos
                        return [4 /*yield*/, TherapySession_1.TherapySession.findByIdAndUpdate(data.sessionId, {
                                $inc: {
                                    gamesPlayed: 1,
                                    totalScore: data.finalScore
                                },
                                $set: {
                                    lastGameAccuracy: data.finalAccuracy,
                                    lastGameDate: new Date()
                                }
                            })];
                    case 2:
                        // Actualizar sesión en la base de datos
                        _a.sent();
                        // Notificar a todos los participantes
                        io.to("session:".concat(data.sessionId)).emit('game-ended', {
                            finalScore: data.finalScore,
                            finalAccuracy: data.finalAccuracy,
                            timestamp: new Date().toISOString()
                        });
                        // Limpiar estado del juego después de un tiempo
                        setTimeout(function () {
                            activeGames.delete(data.sessionId);
                        }, 60000); // 1 minuto
                        console.log("\uD83C\uDFC1 Juego finalizado en sesi\u00F3n ".concat(data.sessionId));
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        socket.emit('error', { message: 'Error al finalizar el juego' });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        // Chat en tiempo real
        socket.on('chat-message', function (data) {
            var message = {
                userId: socket.userId,
                userRole: socket.userRole,
                message: data.message,
                type: data.type,
                timestamp: new Date().toISOString()
            };
            // Enviar a todos los participantes de la sesión
            io.to("session:".concat(data.sessionId)).emit('chat-message', message);
            console.log("\uD83D\uDCAC Mensaje de chat en sesi\u00F3n ".concat(data.sessionId, ": ").concat(data.message));
        });
        // Notificaciones de estado de sesión
        socket.on('session-status', function (data) {
            if (socket.userRole !== 'slp') {
                socket.emit('error', { message: 'Solo los SLP pueden cambiar el estado de la sesión' });
                return;
            }
            var statusUpdate = {
                status: data.status,
                notes: data.notes,
                updatedBy: socket.userId,
                timestamp: new Date().toISOString()
            };
            // Enviar a todos los participantes
            io.to("session:".concat(data.sessionId)).emit('session-status-update', statusUpdate);
            console.log("\uD83D\uDCCA Estado de sesi\u00F3n actualizado: ".concat(data.status, " en sesi\u00F3n ").concat(data.sessionId));
        });
        // Ping para mantener conexión
        socket.on('ping', function () {
            socket.emit('pong', { timestamp: new Date().toISOString() });
        });
        // Desconexión
        socket.on('disconnect', function () {
            console.log("\uD83D\uDD0C Usuario desconectado: ".concat(socket.userId));
            // Limpiar conexiones si el usuario estaba en una sesión
            if (socket.sessionId) {
                var connections = sessionConnections.get(socket.sessionId);
                if (connections) {
                    connections.delete(socket.userId);
                    if (connections.size === 0) {
                        sessionConnections.delete(socket.sessionId);
                    }
                }
                // Notificar a otros participantes
                socket.to("session:".concat(socket.sessionId)).emit('user-disconnected', {
                    userId: socket.userId,
                    userRole: socket.userRole,
                    timestamp: new Date().toISOString()
                });
            }
        });
    });
    // Función para obtener estadísticas de conexiones
    var getConnectionStats = function () {
        return {
            totalConnections: io.engine.clientsCount,
            activeSessions: sessionConnections.size,
            activeGames: activeGames.size,
            sessionConnections: Object.fromEntries(Array.from(sessionConnections.entries()).map(function (_a) {
                var sessionId = _a[0], connections = _a[1];
                return [
                    sessionId,
                    connections.size
                ];
            }))
        };
    };
    // Endpoint para obtener estadísticas (solo para desarrollo)
    if (process.env['NODE_ENV'] === 'development') {
        io.on('get-stats', function () {
            io.emit('connection-stats', getConnectionStats());
        });
    }
    console.log('🔌 WebSocket handlers configurados');
};
exports.setupSocketHandlers = setupSocketHandlers;
