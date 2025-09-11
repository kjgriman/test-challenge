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
// Usar el mismo JWT_SECRET que el middleware HTTP
var JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';
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
                console.log('🔍 Autenticando socket con token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
                console.log('🔍 JWT_SECRET disponible:', JWT_SECRET ? 'SÍ' : 'NO');
                decoded = jwt.verify(token, JWT_SECRET);
                console.log('✅ Token decodificado:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
                return [4 /*yield*/, User_1.User.findById(decoded.userId)];
            case 1:
                user = _a.sent();
                if (!user) {
                    console.log('❌ Usuario no encontrado en BD:', decoded.userId);
                    return [2 /*return*/, false];
                }
                socket.userId = user._id.toString();
                socket.userRole = user.role;
                console.log('✅ Socket autenticado:', { userId: socket.userId, role: socket.userRole });
                return [2 /*return*/, true];
            case 2:
                error_1 = _a.sent();
                console.log('❌ Error autenticando socket:', error_1);
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
                // Verificar que el usuario sea parte de la sesión
                return [2 /*return*/, session.slpId.toString() === socket.userId ||
                        session.childId.toString() === socket.userId];
            case 2:
                error_2 = _a.sent();
                console.error('Error verificando acceso a sesión:', error_2);
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Configurar manejadores de WebSocket
var setupSocketHandlers = function (io) {
    // Middleware de autenticación global
    io.use(function (socket, next) { return __awaiter(void 0, void 0, void 0, function () {
        var token, isAuthenticated, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🔐 Middleware de autenticación WebSocket ejecutándose');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    token = socket.handshake.auth.token || ((_a = socket.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', ''));
                    console.log('🔑 Token en handshake:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
                    if (!token) {
                        console.log('❌ No se proporcionó token');
                        return [2 /*return*/, next(new Error('Token no proporcionado'))];
                    }
                    return [4 /*yield*/, authenticateSocket(socket, token)];
                case 2:
                    isAuthenticated = _b.sent();
                    if (!isAuthenticated) {
                        console.log('❌ Falló la autenticación');
                        return [2 /*return*/, next(new Error('Token inválido'))];
                    }
                    console.log('✅ Autenticación exitosa, continuando...');
                    console.log('🔍 Llamando next()...');
                    next();
                    console.log('🔍 next() ejecutado');
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _b.sent();
                    console.log('❌ Error en middleware de autenticación:', error_3);
                    next(new Error('Error de autenticación'));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Conexión de socket
    io.on('connection', function (socket) {
        console.log('🎯 HANDLER DE CONEXIÓN EJECUTÁNDOSE');
        console.log('🔌 Socket ID:', socket.id);
        console.log('🔌 Handshake auth:', socket.handshake.auth);
        // Unirse a sesión de juego
        socket.on('joinGameSession', function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var sessionId, userId, userRole, roomName, roomSockets, participants, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        sessionId = data.sessionId, userId = data.userId, userRole = data.userRole;
                        if (!sessionId || !userId || !userRole) {
                            socket.emit('gameError', 'Datos de sesión de juego requeridos');
                            return [2 /*return*/];
                        }
                        // Verificar que el userId coincida con el usuario autenticado
                        if (socket.userId !== userId) {
                            console.log('❌ UserId no coincide:', { socketUserId: socket.userId, requestUserId: userId });
                            socket.emit('gameError', 'Token de autenticación inválido');
                            return [2 /*return*/];
                        }
                        roomName = "game-".concat(sessionId);
                        return [4 /*yield*/, socket.join(roomName)];
                    case 1:
                        _a.sent();
                        console.log("\uD83C\uDFAE Usuario ".concat(userId, " se uni\u00F3 a la sala de juego ").concat(sessionId));
                        // Notificar a otros participantes
                        socket.to(roomName).emit('participantJoined', {
                            userId: userId,
                            name: 'Usuario', // TODO: Obtener nombre real del usuario
                            role: userRole,
                            isConnected: true,
                            score: 0
                        });
                        return [4 /*yield*/, io.in(roomName).fetchSockets()];
                    case 2:
                        roomSockets = _a.sent();
                        participants = roomSockets.map(function (s) { return ({
                            userId: s.userId,
                            name: 'Usuario', // TODO: Obtener nombre real del usuario
                            role: s.userRole || 'child',
                            isConnected: true,
                            score: 0
                        }); });
                        // Enviar estado inicial del juego
                        socket.emit('gameStateUpdate', {
                            isPlaying: false,
                            currentTurn: 'slp',
                            score: { slp: 0, child: 0 },
                            round: 1,
                            maxRounds: 10,
                            currentWord: null,
                            selectedAnswer: null,
                            isCorrect: null,
                            timeRemaining: 30,
                            isPaused: false,
                            participants: participants
                        });
                        // Confirmar unión
                        socket.emit('joinedGameSession', {
                            sessionId: sessionId,
                            userId: userId,
                            userRole: userRole
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Error uniéndose a sesión de juego:', error_4);
                        socket.emit('gameError', 'Error interno del servidor');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        // Procesar evento de juego
        socket.on('gameEvent', function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var sessionId, event_1, roomName, rooms, gameState, isCorrect;
            var _a;
            return __generator(this, function (_b) {
                try {
                    sessionId = data.sessionId, event_1 = data.event;
                    if (!sessionId || !event_1) {
                        socket.emit('gameError', 'Datos de evento de juego requeridos');
                        return [2 /*return*/];
                    }
                    roomName = "game-".concat(sessionId);
                    rooms = Array.from(socket.rooms);
                    if (!rooms.includes(roomName)) {
                        socket.emit('gameError', 'No estás en esta sesión de juego');
                        return [2 /*return*/];
                    }
                    // Agregar información del evento
                    event_1.sessionId = sessionId;
                    event_1.timestamp = Date.now();
                    console.log("\uD83C\uDFAE Evento de juego recibido: ".concat(event_1.type, " en sesi\u00F3n ").concat(sessionId));
                    // Manejar eventos específicos del juego
                    switch (event_1.type) {
                        case 'gameStart':
                            // Inicializar estado del juego
                            activeGames.set(sessionId, {
                                isPlaying: true,
                                currentTurn: 'slp',
                                score: { slp: 0, child: 0 },
                                round: 1,
                                maxRounds: 10,
                                currentWord: event_1.data.currentWord,
                                selectedAnswer: null,
                                isCorrect: null,
                                timeRemaining: 30,
                                isPaused: false,
                                participants: []
                            });
                            break;
                        case 'answerSelected':
                            gameState = activeGames.get(sessionId);
                            if (gameState) {
                                isCorrect = event_1.data.answer === ((_a = gameState.currentWord) === null || _a === void 0 ? void 0 : _a.word);
                                gameState.isCorrect = isCorrect;
                                gameState.selectedAnswer = event_1.data.answer;
                                // Actualizar puntuación
                                if (isCorrect) {
                                    if (gameState.currentTurn === 'slp') {
                                        gameState.score.slp += 10;
                                    }
                                    else {
                                        gameState.score.child += 10;
                                    }
                                }
                                // Cambiar turno
                                gameState.currentTurn = gameState.currentTurn === 'slp' ? 'child' : 'slp';
                                // Enviar estado actualizado
                                io.to(roomName).emit('gameStateUpdate', gameState);
                            }
                            break;
                        case 'gameEnd':
                            // Finalizar juego
                            activeGames.delete(sessionId);
                            break;
                    }
                    // Reenviar evento a todos los participantes de la sala
                    io.to(roomName).emit('gameEvent', event_1);
                }
                catch (error) {
                    console.error('Error procesando evento de juego:', error);
                    socket.emit('gameError', 'Error interno del servidor');
                }
                return [2 /*return*/];
            });
        }); });
        // Solicitar estado del juego
        socket.on('requestGameState', function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var sessionId, roomName, rooms, roomSockets, participants, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sessionId = data.sessionId;
                        if (!sessionId) {
                            socket.emit('gameError', 'ID de sesión requerido');
                            return [2 /*return*/];
                        }
                        roomName = "game-".concat(sessionId);
                        rooms = Array.from(socket.rooms);
                        if (!rooms.includes(roomName)) {
                            socket.emit('gameError', 'No estás en esta sesión de juego');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, io.in(roomName).fetchSockets()];
                    case 1:
                        roomSockets = _a.sent();
                        participants = roomSockets.map(function (s) { return ({
                            userId: s.userId,
                            name: 'Usuario', // TODO: Obtener nombre real del usuario
                            role: s.userRole || 'child',
                            isConnected: true,
                            score: 0
                        }); });
                        // Enviar estado actual
                        socket.emit('gameStateUpdate', {
                            isPlaying: false,
                            currentTurn: 'slp',
                            score: { slp: 0, child: 0 },
                            round: 1,
                            maxRounds: 10,
                            currentWord: null,
                            selectedAnswer: null,
                            isCorrect: null,
                            timeRemaining: 30,
                            isPaused: false,
                            participants: participants
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error obteniendo estado del juego:', error_5);
                        socket.emit('gameError', 'Error interno del servidor');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        // Desconexión
        socket.on('disconnect', function () {
            console.log("\uD83D\uDD0C Usuario desconectado: ".concat(socket.userId, ", raz\u00F3n: ").concat(socket.disconnected ? 'desconectado' : 'desconectado por servidor'));
            // Limpiar conexiones de sesión
            for (var _i = 0, _a = Array.from(sessionConnections.entries()); _i < _a.length; _i++) {
                var _b = _a[_i], sessionId = _b[0], connections = _b[1];
                connections.delete(socket.id);
                if (connections.size === 0) {
                    sessionConnections.delete(sessionId);
                }
            }
        });
    });
    console.log('🔌 WebSocket handlers configurados');
};
exports.setupSocketHandlers = setupSocketHandlers;
