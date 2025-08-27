"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.getCaseload = exports.getUpcomingSessions = exports.getRecentSessions = exports.getDashboardStats = void 0;
var User_1 = require("../models/User");
var TherapySession_1 = require("../models/TherapySession");
var responseUtils_1 = require("../utils/responseUtils");
// Clase de error simple para evitar problemas de importación
var AuthenticationError = /** @class */ (function (_super) {
    __extends(AuthenticationError, _super);
    function AuthenticationError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'AuthenticationError';
        return _this;
    }
    return AuthenticationError;
}(Error));
// Controlador para obtener estadísticas del dashboard
var getDashboardStats = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userRole, stats, totalSessions, activeSessions, totalStudents, completedSessions, gamesPlayed, averageAccuracy, totalTime, totalSessions, activeSessions, totalStudents, completedSessions, gamesPlayed, averageAccuracy, totalTime, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 10, , 11]);
                if (!req.user) {
                    throw new AuthenticationError('Usuario no autenticado');
                }
                userId = req.user._id;
                userRole = req.user.role;
                stats = void 0;
                if (!(userRole === 'slp')) return [3 /*break*/, 5];
                return [4 /*yield*/, TherapySession_1.TherapySession.countDocuments({
                        slpId: userId
                    })];
            case 1:
                totalSessions = _a.sent();
                return [4 /*yield*/, TherapySession_1.TherapySession.countDocuments({
                        slpId: userId,
                        status: 'active'
                    })];
            case 2:
                activeSessions = _a.sent();
                return [4 /*yield*/, User_1.User.countDocuments({
                        role: 'child',
                        'child.currentSLP': userId
                    })];
            case 3:
                totalStudents = _a.sent();
                return [4 /*yield*/, TherapySession_1.TherapySession.find({
                        slpId: userId,
                        status: 'completed'
                    })];
            case 4:
                completedSessions = _a.sent();
                gamesPlayed = completedSessions.length * 2;
                averageAccuracy = 85;
                totalTime = completedSessions.length * 45;
                stats = {
                    totalSessions: totalSessions,
                    activeSessions: activeSessions,
                    totalStudents: totalStudents,
                    gamesPlayed: gamesPlayed,
                    averageAccuracy: averageAccuracy,
                    totalTime: totalTime
                };
                return [3 /*break*/, 9];
            case 5: return [4 /*yield*/, TherapySession_1.TherapySession.countDocuments({
                    childId: userId
                })];
            case 6:
                totalSessions = _a.sent();
                return [4 /*yield*/, TherapySession_1.TherapySession.countDocuments({
                        childId: userId,
                        status: 'active'
                    })];
            case 7:
                activeSessions = _a.sent();
                totalStudents = 1;
                return [4 /*yield*/, TherapySession_1.TherapySession.find({
                        childId: userId,
                        status: 'completed'
                    })];
            case 8:
                completedSessions = _a.sent();
                gamesPlayed = completedSessions.length * 2;
                averageAccuracy = 85;
                totalTime = completedSessions.length * 45;
                stats = {
                    totalSessions: totalSessions,
                    activeSessions: activeSessions,
                    totalStudents: totalStudents,
                    gamesPlayed: gamesPlayed,
                    averageAccuracy: averageAccuracy,
                    totalTime: totalTime
                };
                _a.label = 9;
            case 9:
                (0, responseUtils_1.sendSuccessResponse)(res, stats, 'Estadísticas del dashboard obtenidas');
                return [3 /*break*/, 11];
            case 10:
                error_1 = _a.sent();
                next(error_1);
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); };
exports.getDashboardStats = getDashboardStats;
// Controlador para obtener sesiones recientes
var getRecentSessions = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userRole_1, sessions, recentSessions, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!req.user) {
                    throw new AuthenticationError('Usuario no autenticado');
                }
                userId = req.user._id;
                userRole_1 = req.user.role;
                sessions = void 0;
                if (!(userRole_1 === 'slp')) return [3 /*break*/, 2];
                return [4 /*yield*/, TherapySession_1.TherapySession.find({ slpId: userId })
                        .populate('childId', 'firstName lastName')
                        .sort({ createdAt: -1 })
                        .limit(5)];
            case 1:
                // Sesiones recientes para SLP
                sessions = _a.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, TherapySession_1.TherapySession.find({ childId: userId })
                    .populate('slpId', 'firstName lastName')
                    .sort({ createdAt: -1 })
                    .limit(5)];
            case 3:
                // Sesiones recientes para Child
                sessions = _a.sent();
                _a.label = 4;
            case 4:
                recentSessions = sessions.map(function (session) { return ({
                    id: session._id.toString(),
                    studentName: userRole_1 === 'slp'
                        ? "".concat(session.childId.firstName, " ").concat(session.childId.lastName)
                        : "".concat(session.slpId.firstName, " ").concat(session.slpId.lastName),
                    date: session.createdAt.toISOString().split('T')[0],
                    duration: "45 min", // Placeholder
                    accuracy: 85, // Placeholder
                    status: session.status
                }); });
                (0, responseUtils_1.sendSuccessResponse)(res, recentSessions, 'Sesiones recientes obtenidas');
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                next(error_2);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.getRecentSessions = getRecentSessions;
// Controlador para obtener próximas sesiones
var getUpcomingSessions = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userRole_2, sessions, upcomingSessions, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!req.user) {
                    throw new AuthenticationError('Usuario no autenticado');
                }
                userId = req.user._id;
                userRole_2 = req.user.role;
                sessions = void 0;
                if (!(userRole_2 === 'slp')) return [3 /*break*/, 2];
                return [4 /*yield*/, TherapySession_1.TherapySession.find({
                        slpId: userId,
                        status: 'scheduled',
                        scheduledDate: { $gte: new Date() }
                    })
                        .populate('childId', 'firstName lastName')
                        .sort({ scheduledDate: 1 })
                        .limit(5)];
            case 1:
                // Próximas sesiones para SLP
                sessions = _a.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, TherapySession_1.TherapySession.find({
                    childId: userId,
                    status: 'scheduled',
                    scheduledDate: { $gte: new Date() }
                })
                    .populate('slpId', 'firstName lastName')
                    .sort({ scheduledDate: 1 })
                    .limit(5)];
            case 3:
                // Próximas sesiones para Child
                sessions = _a.sent();
                _a.label = 4;
            case 4:
                upcomingSessions = sessions.map(function (session) { return ({
                    id: session._id.toString(),
                    studentName: userRole_2 === 'slp'
                        ? "".concat(session.childId.firstName, " ").concat(session.childId.lastName)
                        : "".concat(session.slpId.firstName, " ").concat(session.slpId.lastName),
                    date: session.scheduledDate.toISOString().split('T')[0] || '',
                    time: session.scheduledDate.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    type: 'Terapia del Habla' // Placeholder
                }); });
                (0, responseUtils_1.sendSuccessResponse)(res, upcomingSessions, 'Próximas sesiones obtenidas');
                return [3 /*break*/, 6];
            case 5:
                error_3 = _a.sent();
                next(error_3);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.getUpcomingSessions = getUpcomingSessions;
// Controlador para obtener lista de estudiantes (caseload) para SLP
var getCaseload = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var slpId, students, caseload, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.user || req.user.role !== 'slp') {
                    throw new AuthenticationError('Acceso denegado - Solo para SLP');
                }
                slpId = req.user._id;
                return [4 /*yield*/, User_1.User.find({
                        role: 'child',
                        'child.currentSLP': slpId
                    }).select('firstName lastName email child.skillLevel child.sessionsCompleted child.totalSessionTime')];
            case 1:
                students = _a.sent();
                caseload = students.map(function (student) {
                    var _a, _b, _c;
                    return ({
                        id: student._id.toString(),
                        firstName: student.firstName,
                        lastName: student.lastName,
                        email: student.email,
                        skillLevel: (_a = student.child) === null || _a === void 0 ? void 0 : _a.skillLevel,
                        sessionsCompleted: ((_b = student.child) === null || _b === void 0 ? void 0 : _b.sessionsCompleted) || 0,
                        totalSessionTime: ((_c = student.child) === null || _c === void 0 ? void 0 : _c.totalSessionTime) || 0
                    });
                });
                (0, responseUtils_1.sendSuccessResponse)(res, caseload, 'Caseload obtenido');
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                next(error_4);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getCaseload = getCaseload;
