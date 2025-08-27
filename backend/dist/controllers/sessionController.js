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
exports.getSessionParticipants = exports.endSession = exports.startSession = exports.leaveSession = exports.joinSession = exports.deleteSession = exports.updateSession = exports.getSessionById = exports.getSessions = exports.createSession = void 0;
var TherapySession_1 = require("../models/TherapySession");
var User_1 = require("../models/User");
var responseUtils_1 = require("../utils/responseUtils");
var errors_1 = require("../utils/errors");
// Crear nueva sesión
var createSession = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var slpId, sessionData, child, session, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                slpId = req.user._id;
                sessionData = req.body;
                return [4 /*yield*/, User_1.User.findById(sessionData.childId)];
            case 1:
                child = _a.sent();
                if (!child || child.role !== 'child') {
                    throw new errors_1.NotFoundError('Estudiante no encontrado');
                }
                // Validar que la fecha no sea en el pasado
                if (sessionData.scheduledDate < new Date()) {
                    throw new errors_1.ValidationError('La fecha programada no puede ser en el pasado');
                }
                session = new TherapySession_1.TherapySession({
                    slpId: slpId,
                    childId: sessionData.childId,
                    scheduledDate: sessionData.scheduledDate,
                    duration: sessionData.duration,
                    sessionType: sessionData.sessionType,
                    notes: sessionData.notes,
                    goals: sessionData.goals,
                    status: TherapySession_1.SessionStatus.SCHEDULED
                });
                return [4 /*yield*/, session.save()];
            case 2:
                _a.sent();
                // Populate para obtener información completa
                return [4 /*yield*/, session.populate('childId', 'firstName lastName')];
            case 3:
                // Populate para obtener información completa
                _a.sent();
                return [4 /*yield*/, session.populate('slpId', 'firstName lastName')];
            case 4:
                _a.sent();
                (0, responseUtils_1.sendSuccessResponse)(res, session, 'Sesión creada exitosamente', 201);
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                next(error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.createSession = createSession;
// Obtener todas las sesiones del usuario
var getSessions = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userRole, _a, status_1, _b, page, _c, limit, query, skip, sessions, total, error_2;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                userId = req.user._id;
                userRole = req.user.role;
                _a = req.query, status_1 = _a.status, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c;
                query = {};
                // Filtrar por rol del usuario
                if (userRole === 'slp') {
                    query.slpId = userId;
                }
                else {
                    query.childId = userId;
                }
                // Filtrar por estado si se especifica
                if (status_1) {
                    query.status = status_1;
                }
                skip = (Number(page) - 1) * Number(limit);
                return [4 /*yield*/, TherapySession_1.TherapySession.find(query)
                        .populate('childId', 'firstName lastName')
                        .populate('slpId', 'firstName lastName')
                        .sort({ scheduledDate: -1 })
                        .skip(skip)
                        .limit(Number(limit))];
            case 1:
                sessions = _d.sent();
                return [4 /*yield*/, TherapySession_1.TherapySession.countDocuments(query)];
            case 2:
                total = _d.sent();
                (0, responseUtils_1.sendSuccessResponse)(res, {
                    sessions: sessions,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: total,
                        pages: Math.ceil(total / Number(limit))
                    }
                }, 'Sesiones obtenidas exitosamente');
                return [3 /*break*/, 4];
            case 3:
                error_2 = _d.sent();
                next(error_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getSessions = getSessions;
// Obtener sesión por ID
var getSessionById = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, userId, userRole, session, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                sessionId = req.params['id'];
                userId = req.user._id;
                userRole = req.user.role;
                return [4 /*yield*/, TherapySession_1.TherapySession.findById(sessionId)
                        .populate('childId', 'firstName lastName email child')
                        .populate('slpId', 'firstName lastName email slp')];
            case 1:
                session = _a.sent();
                if (!session) {
                    throw new errors_1.NotFoundError('Sesión no encontrada');
                }
                // Verificar permisos
                if (userRole === 'slp' && session.slpId.toString() !== userId.toString()) {
                    throw new errors_1.ValidationError('No tienes permisos para ver esta sesión');
                }
                if (userRole === 'child' && session.childId.toString() !== userId.toString()) {
                    throw new errors_1.ValidationError('No tienes permisos para ver esta sesión');
                }
                (0, responseUtils_1.sendSuccessResponse)(res, session, 'Sesión obtenida exitosamente');
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                next(error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getSessionById = getSessionById;
// Actualizar sesión
var updateSession = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, slpId, updateData, session, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                sessionId = req.params['id'];
                slpId = req.user._id;
                updateData = req.body;
                return [4 /*yield*/, TherapySession_1.TherapySession.findById(sessionId)];
            case 1:
                session = _a.sent();
                if (!session) {
                    throw new errors_1.NotFoundError('Sesión no encontrada');
                }
                // Verificar que el SLP es el propietario de la sesión
                if (session.slpId.toString() !== slpId.toString()) {
                    throw new errors_1.ValidationError('No tienes permisos para modificar esta sesión');
                }
                // Validar fecha si se está actualizando
                if (updateData.scheduledDate && updateData.scheduledDate < new Date()) {
                    throw new errors_1.ValidationError('La fecha programada no puede ser en el pasado');
                }
                // Actualizar la sesión
                Object.assign(session, updateData);
                return [4 /*yield*/, session.save()];
            case 2:
                _a.sent();
                // Populate para obtener información completa
                return [4 /*yield*/, session.populate('childId', 'firstName lastName')];
            case 3:
                // Populate para obtener información completa
                _a.sent();
                return [4 /*yield*/, session.populate('slpId', 'firstName lastName')];
            case 4:
                _a.sent();
                (0, responseUtils_1.sendSuccessResponse)(res, session, 'Sesión actualizada exitosamente');
                return [3 /*break*/, 6];
            case 5:
                error_4 = _a.sent();
                next(error_4);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.updateSession = updateSession;
// Eliminar sesión
var deleteSession = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, slpId, session, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                sessionId = req.params['id'];
                slpId = req.user._id;
                return [4 /*yield*/, TherapySession_1.TherapySession.findById(sessionId)];
            case 1:
                session = _a.sent();
                if (!session) {
                    throw new errors_1.NotFoundError('Sesión no encontrada');
                }
                // Verificar que el SLP es el propietario de la sesión
                if (session.slpId.toString() !== slpId.toString()) {
                    throw new errors_1.ValidationError('No tienes permisos para eliminar esta sesión');
                }
                // Solo permitir eliminar sesiones programadas
                if (session.status !== TherapySession_1.SessionStatus.SCHEDULED) {
                    throw new errors_1.ValidationError('Solo se pueden eliminar sesiones programadas');
                }
                return [4 /*yield*/, TherapySession_1.TherapySession.findByIdAndDelete(sessionId)];
            case 2:
                _a.sent();
                (0, responseUtils_1.sendSuccessResponse)(res, null, 'Sesión eliminada exitosamente');
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                next(error_5);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.deleteSession = deleteSession;
// Unirse a una sesión
var joinSession = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, userId, userRole, session, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                sessionId = req.params['id'];
                userId = req.user._id;
                userRole = req.user.role;
                return [4 /*yield*/, TherapySession_1.TherapySession.findById(sessionId)];
            case 1:
                session = _a.sent();
                if (!session) {
                    throw new errors_1.NotFoundError('Sesión no encontrada');
                }
                // Verificar que el usuario puede unirse a la sesión
                if (userRole === 'slp' && session.slpId.toString() !== userId.toString()) {
                    throw new errors_1.ValidationError('No puedes unirte a esta sesión');
                }
                if (userRole === 'child' && session.childId.toString() !== userId.toString()) {
                    throw new errors_1.ValidationError('No puedes unirte a esta sesión');
                }
                // Verificar que la sesión esté activa
                if (session.status !== TherapySession_1.SessionStatus.IN_PROGRESS) {
                    throw new errors_1.ValidationError('La sesión no está activa');
                }
                (0, responseUtils_1.sendSuccessResponse)(res, { sessionId: sessionId }, 'Te has unido a la sesión exitosamente');
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                next(error_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.joinSession = joinSession;
// Salir de una sesión
var leaveSession = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, session, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                sessionId = req.params['id'];
                return [4 /*yield*/, TherapySession_1.TherapySession.findById(sessionId)];
            case 1:
                session = _a.sent();
                if (!session) {
                    throw new errors_1.NotFoundError('Sesión no encontrada');
                }
                (0, responseUtils_1.sendSuccessResponse)(res, { sessionId: sessionId }, 'Has salido de la sesión exitosamente');
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                next(error_7);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.leaveSession = leaveSession;
// Iniciar sesión
var startSession = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, slpId, session, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                sessionId = req.params['id'];
                slpId = req.user._id;
                return [4 /*yield*/, TherapySession_1.TherapySession.findById(sessionId)];
            case 1:
                session = _a.sent();
                if (!session) {
                    throw new errors_1.NotFoundError('Sesión no encontrada');
                }
                // Verificar que el SLP es el propietario de la sesión
                if (session.slpId.toString() !== slpId.toString()) {
                    throw new errors_1.ValidationError('No tienes permisos para iniciar esta sesión');
                }
                // Verificar que la sesión esté programada
                if (session.status !== TherapySession_1.SessionStatus.SCHEDULED) {
                    throw new errors_1.ValidationError('Solo se pueden iniciar sesiones programadas');
                }
                // Actualizar estado y agregar hora de inicio
                session.status = TherapySession_1.SessionStatus.IN_PROGRESS;
                session.startTime = new Date();
                return [4 /*yield*/, session.save()];
            case 2:
                _a.sent();
                (0, responseUtils_1.sendSuccessResponse)(res, session, 'Sesión iniciada exitosamente');
                return [3 /*break*/, 4];
            case 3:
                error_8 = _a.sent();
                next(error_8);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.startSession = startSession;
// Finalizar sesión
var endSession = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, slpId, _a, notes, gamesPlayed, accuracy, session, error_9;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                sessionId = req.params['id'];
                slpId = req.user._id;
                _a = req.body, notes = _a.notes, gamesPlayed = _a.gamesPlayed, accuracy = _a.accuracy;
                return [4 /*yield*/, TherapySession_1.TherapySession.findById(sessionId)];
            case 1:
                session = _b.sent();
                if (!session) {
                    throw new errors_1.NotFoundError('Sesión no encontrada');
                }
                // Verificar que el SLP es el propietario de la sesión
                if (session.slpId.toString() !== slpId.toString()) {
                    throw new errors_1.ValidationError('No tienes permisos para finalizar esta sesión');
                }
                // Verificar que la sesión esté en progreso
                if (session.status !== TherapySession_1.SessionStatus.IN_PROGRESS) {
                    throw new errors_1.ValidationError('Solo se pueden finalizar sesiones en progreso');
                }
                // Actualizar sesión
                session.status = TherapySession_1.SessionStatus.COMPLETED;
                session.endTime = new Date();
                if (notes)
                    session.notes = notes;
                if (gamesPlayed !== undefined)
                    session.gamesPlayed = gamesPlayed;
                if (accuracy !== undefined)
                    session.accuracy = accuracy;
                // Calcular duración real
                if (session.startTime && session.endTime) {
                    session.duration = Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000);
                }
                return [4 /*yield*/, session.save()];
            case 2:
                _b.sent();
                (0, responseUtils_1.sendSuccessResponse)(res, session, 'Sesión finalizada exitosamente');
                return [3 /*break*/, 4];
            case 3:
                error_9 = _b.sent();
                next(error_9);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.endSession = endSession;
// Obtener participantes de una sesión
var getSessionParticipants = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, userId, userRole, session, participants, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                sessionId = req.params['id'];
                userId = req.user._id;
                userRole = req.user.role;
                return [4 /*yield*/, TherapySession_1.TherapySession.findById(sessionId)
                        .populate('childId', 'firstName lastName email')
                        .populate('slpId', 'firstName lastName email')];
            case 1:
                session = _a.sent();
                if (!session) {
                    throw new errors_1.NotFoundError('Sesión no encontrada');
                }
                // Verificar permisos
                if (userRole === 'slp' && session.slpId.toString() !== userId.toString()) {
                    throw new errors_1.ValidationError('No tienes permisos para ver esta sesión');
                }
                if (userRole === 'child' && session.childId.toString() !== userId.toString()) {
                    throw new errors_1.ValidationError('No tienes permisos para ver esta sesión');
                }
                participants = {
                    slp: session.slpId,
                    child: session.childId
                };
                (0, responseUtils_1.sendSuccessResponse)(res, participants, 'Participantes obtenidos exitosamente');
                return [3 /*break*/, 3];
            case 2:
                error_10 = _a.sent();
                next(error_10);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getSessionParticipants = getSessionParticipants;
