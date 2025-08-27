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
exports.removeStudentFromSLP = exports.assignStudentToSLP = exports.getStudentProgress = exports.deleteStudent = exports.updateStudent = exports.createStudent = exports.getStudentById = exports.getStudents = void 0;
var User_1 = require("../models/User");
var TherapySession_1 = require("../models/TherapySession");
var responseUtils_1 = require("../utils/responseUtils");
var errors_1 = require("../utils/errors");
// Obtener todos los estudiantes del SLP
var getStudents = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var slpId, _a, _b, page, _c, limit, skillLevel, search, query, skip, students, total, error_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                slpId = req.user._id;
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c, skillLevel = _a.skillLevel, search = _a.search;
                query = {
                    role: 'child',
                    'child.currentSLP': slpId
                };
                // Filtrar por nivel de habilidad
                if (skillLevel) {
                    query['child.skillLevel'] = skillLevel;
                }
                // Búsqueda por nombre o email
                if (search) {
                    query.$or = [
                        { firstName: { $regex: search, $options: 'i' } },
                        { lastName: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ];
                }
                skip = (Number(page) - 1) * Number(limit);
                return [4 /*yield*/, User_1.User.find(query)
                        .select('firstName lastName email child.skillLevel child.sessionsCompleted child.totalSessionTime child.primaryGoals')
                        .sort({ firstName: 1, lastName: 1 })
                        .skip(skip)
                        .limit(Number(limit))];
            case 1:
                students = _d.sent();
                return [4 /*yield*/, User_1.User.countDocuments(query)];
            case 2:
                total = _d.sent();
                (0, responseUtils_1.sendSuccessResponse)(res, {
                    students: students,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: total,
                        pages: Math.ceil(total / Number(limit))
                    }
                }, 'Estudiantes obtenidos exitosamente');
                return [3 /*break*/, 4];
            case 3:
                error_1 = _d.sent();
                next(error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getStudents = getStudents;
// Obtener estudiante por ID
var getStudentById = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var studentId, slpId, student, error_2;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                studentId = req.params['id'];
                slpId = req.user._id;
                return [4 /*yield*/, User_1.User.findById(studentId)];
            case 1:
                student = _c.sent();
                if (!student || student.role !== 'child') {
                    throw new errors_1.NotFoundError('Estudiante no encontrado');
                }
                // Verificar que el estudiante pertenece al SLP
                if (((_b = (_a = student.child) === null || _a === void 0 ? void 0 : _a.currentSLP) === null || _b === void 0 ? void 0 : _b.toString()) !== slpId.toString()) {
                    throw new errors_1.ValidationError('No tienes permisos para ver este estudiante');
                }
                (0, responseUtils_1.sendSuccessResponse)(res, student, 'Estudiante obtenido exitosamente');
                return [3 /*break*/, 3];
            case 2:
                error_2 = _c.sent();
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getStudentById = getStudentById;
// Crear nuevo estudiante
var createStudent = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var slpId, studentData, existingUser, student, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                slpId = req.user._id;
                studentData = req.body;
                return [4 /*yield*/, User_1.User.findOne({ email: studentData.email })];
            case 1:
                existingUser = _a.sent();
                if (existingUser) {
                    throw new errors_1.ConflictError('El email ya está registrado');
                }
                student = new User_1.User({
                    email: studentData.email,
                    password: studentData.password, // Se hasheará automáticamente
                    firstName: studentData.firstName,
                    lastName: studentData.lastName,
                    role: 'child',
                    child: {
                        parentEmail: studentData.parentEmail,
                        skillLevel: studentData.skillLevel,
                        primaryGoals: studentData.primaryGoals,
                        sessionsCompleted: 0,
                        totalSessionTime: 0,
                        currentSLP: slpId,
                        notes: studentData.notes
                    }
                });
                return [4 /*yield*/, student.save()];
            case 2:
                _a.sent();
                // Actualizar el contador de estudiantes del SLP
                return [4 /*yield*/, User_1.User.findByIdAndUpdate(slpId, {
                        $inc: { 'slp.caseloadCount': 1 }
                    })];
            case 3:
                // Actualizar el contador de estudiantes del SLP
                _a.sent();
                (0, responseUtils_1.sendSuccessResponse)(res, student, 'Estudiante creado exitosamente', 201);
                return [3 /*break*/, 5];
            case 4:
                error_3 = _a.sent();
                next(error_3);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.createStudent = createStudent;
// Actualizar estudiante
var updateStudent = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var studentId, slpId, updateData, student, error_4;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                studentId = req.params['id'];
                slpId = req.user._id;
                updateData = req.body;
                return [4 /*yield*/, User_1.User.findById(studentId)];
            case 1:
                student = _c.sent();
                if (!student || student.role !== 'child') {
                    throw new errors_1.NotFoundError('Estudiante no encontrado');
                }
                // Verificar que el estudiante pertenece al SLP
                if (((_b = (_a = student.child) === null || _a === void 0 ? void 0 : _a.currentSLP) === null || _b === void 0 ? void 0 : _b.toString()) !== slpId.toString()) {
                    throw new errors_1.ValidationError('No tienes permisos para modificar este estudiante');
                }
                // Actualizar campos básicos
                if (updateData.firstName)
                    student.firstName = updateData.firstName;
                if (updateData.lastName)
                    student.lastName = updateData.lastName;
                // Actualizar campos del child
                if (updateData.parentEmail)
                    student.child.parentEmail = updateData.parentEmail;
                if (updateData.skillLevel)
                    student.child.skillLevel = updateData.skillLevel;
                if (updateData.primaryGoals)
                    student.child.primaryGoals = updateData.primaryGoals;
                if (updateData.notes)
                    student.child.notes = updateData.notes;
                return [4 /*yield*/, student.save()];
            case 2:
                _c.sent();
                (0, responseUtils_1.sendSuccessResponse)(res, student, 'Estudiante actualizado exitosamente');
                return [3 /*break*/, 4];
            case 3:
                error_4 = _c.sent();
                next(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateStudent = updateStudent;
// Eliminar estudiante
var deleteStudent = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var studentId, slpId, student, activeSessions, error_5;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 5, , 6]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                studentId = req.params['id'];
                slpId = req.user._id;
                return [4 /*yield*/, User_1.User.findById(studentId)];
            case 1:
                student = _c.sent();
                if (!student || student.role !== 'child') {
                    throw new errors_1.NotFoundError('Estudiante no encontrado');
                }
                // Verificar que el estudiante pertenece al SLP
                if (((_b = (_a = student.child) === null || _a === void 0 ? void 0 : _a.currentSLP) === null || _b === void 0 ? void 0 : _b.toString()) !== slpId.toString()) {
                    throw new errors_1.ValidationError('No tienes permisos para eliminar este estudiante');
                }
                return [4 /*yield*/, TherapySession_1.TherapySession.countDocuments({
                        childId: studentId,
                        status: { $in: ['scheduled', 'in_progress'] }
                    })];
            case 2:
                activeSessions = _c.sent();
                if (activeSessions > 0) {
                    throw new errors_1.ValidationError('No se puede eliminar un estudiante con sesiones activas');
                }
                // Eliminar el estudiante
                return [4 /*yield*/, User_1.User.findByIdAndDelete(studentId)];
            case 3:
                // Eliminar el estudiante
                _c.sent();
                // Actualizar el contador de estudiantes del SLP
                return [4 /*yield*/, User_1.User.findByIdAndUpdate(slpId, {
                        $inc: { 'slp.caseloadCount': -1 }
                    })];
            case 4:
                // Actualizar el contador de estudiantes del SLP
                _c.sent();
                (0, responseUtils_1.sendSuccessResponse)(res, null, 'Estudiante eliminado exitosamente');
                return [3 /*break*/, 6];
            case 5:
                error_5 = _c.sent();
                next(error_5);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.deleteStudent = deleteStudent;
// Obtener progreso del estudiante
var getStudentProgress = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var studentId, slpId, _a, period, student, startDate, sessions_1, totalSessions, totalTime, averageAccuracy, totalGames, goalsProgress, progress, error_6;
    var _b, _c, _d, _e, _f, _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                _h.trys.push([0, 3, , 4]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                studentId = req.params['id'];
                slpId = req.user._id;
                _a = req.query.period, period = _a === void 0 ? '30' : _a;
                return [4 /*yield*/, User_1.User.findById(studentId)];
            case 1:
                student = _h.sent();
                if (!student || student.role !== 'child') {
                    throw new errors_1.NotFoundError('Estudiante no encontrado');
                }
                // Verificar que el estudiante pertenece al SLP
                if (((_c = (_b = student.child) === null || _b === void 0 ? void 0 : _b.currentSLP) === null || _c === void 0 ? void 0 : _c.toString()) !== slpId.toString()) {
                    throw new errors_1.ValidationError('No tienes permisos para ver este estudiante');
                }
                startDate = new Date();
                startDate.setDate(startDate.getDate() - Number(period));
                return [4 /*yield*/, TherapySession_1.TherapySession.find({
                        childId: studentId,
                        status: 'completed',
                        endTime: { $gte: startDate }
                    }).sort({ endTime: -1 })];
            case 2:
                sessions_1 = _h.sent();
                totalSessions = sessions_1.length;
                totalTime = sessions_1.reduce(function (sum, session) { return sum + (session.duration || 0); }, 0);
                averageAccuracy = sessions_1.length > 0
                    ? sessions_1.reduce(function (sum, session) { return sum + (session.accuracy || 0); }, 0) / sessions_1.length
                    : 0;
                totalGames = sessions_1.reduce(function (sum, session) { return sum + (session.gamesPlayed || 0); }, 0);
                goalsProgress = ((_e = (_d = student.child) === null || _d === void 0 ? void 0 : _d.primaryGoals) === null || _e === void 0 ? void 0 : _e.map(function (goal) { return ({
                    goal: goal,
                    sessionsCount: sessions_1.filter(function (s) { var _a; return (_a = s.goals) === null || _a === void 0 ? void 0 : _a.includes(goal); }).length,
                    averageAccuracy: sessions_1.filter(function (s) { var _a; return (_a = s.goals) === null || _a === void 0 ? void 0 : _a.includes(goal); })
                        .reduce(function (sum, s) { return sum + (s.accuracy || 0); }, 0) /
                        Math.max(sessions_1.filter(function (s) { var _a; return (_a = s.goals) === null || _a === void 0 ? void 0 : _a.includes(goal); }).length, 1)
                }); })) || [];
                progress = {
                    student: {
                        id: student._id,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        skillLevel: (_f = student.child) === null || _f === void 0 ? void 0 : _f.skillLevel,
                        primaryGoals: (_g = student.child) === null || _g === void 0 ? void 0 : _g.primaryGoals
                    },
                    period: Number(period),
                    stats: {
                        totalSessions: totalSessions,
                        totalTime: totalTime,
                        averageAccuracy: Math.round(averageAccuracy * 100) / 100,
                        totalGames: totalGames
                    },
                    goalsProgress: goalsProgress,
                    recentSessions: sessions_1.slice(0, 5) // Últimas 5 sesiones
                };
                (0, responseUtils_1.sendSuccessResponse)(res, progress, 'Progreso del estudiante obtenido exitosamente');
                return [3 /*break*/, 4];
            case 3:
                error_6 = _h.sent();
                next(error_6);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getStudentProgress = getStudentProgress;
// Asignar estudiante a SLP
var assignStudentToSLP = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var studentId, slpId, student, error_7;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 6, , 7]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                studentId = req.params['id'];
                slpId = req.user._id;
                return [4 /*yield*/, User_1.User.findById(studentId)];
            case 1:
                student = _d.sent();
                if (!student || student.role !== 'child') {
                    throw new errors_1.NotFoundError('Estudiante no encontrado');
                }
                // Verificar que el estudiante no esté ya asignado a este SLP
                if (((_b = (_a = student.child) === null || _a === void 0 ? void 0 : _a.currentSLP) === null || _b === void 0 ? void 0 : _b.toString()) === slpId.toString()) {
                    throw new errors_1.ConflictError('El estudiante ya está asignado a este SLP');
                }
                // Actualizar asignación
                student.child.currentSLP = slpId;
                return [4 /*yield*/, student.save()];
            case 2:
                _d.sent();
                if (!((_c = student.child) === null || _c === void 0 ? void 0 : _c.currentSLP)) return [3 /*break*/, 4];
                // Decrementar contador del SLP anterior
                return [4 /*yield*/, User_1.User.findByIdAndUpdate(student.child.currentSLP, {
                        $inc: { 'slp.caseloadCount': -1 }
                    })];
            case 3:
                // Decrementar contador del SLP anterior
                _d.sent();
                _d.label = 4;
            case 4: 
            // Incrementar contador del nuevo SLP
            return [4 /*yield*/, User_1.User.findByIdAndUpdate(slpId, {
                    $inc: { 'slp.caseloadCount': 1 }
                })];
            case 5:
                // Incrementar contador del nuevo SLP
                _d.sent();
                (0, responseUtils_1.sendSuccessResponse)(res, student, 'Estudiante asignado exitosamente');
                return [3 /*break*/, 7];
            case 6:
                error_7 = _d.sent();
                next(error_7);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.assignStudentToSLP = assignStudentToSLP;
// Remover estudiante del SLP
var removeStudentFromSLP = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var studentId, slpId, student, activeSessions, error_8;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 5, , 6]);
                if (!req.user) {
                    throw new errors_1.ValidationError('Usuario no autenticado');
                }
                studentId = req.params['id'];
                slpId = req.user._id;
                return [4 /*yield*/, User_1.User.findById(studentId)];
            case 1:
                student = _c.sent();
                if (!student || student.role !== 'child') {
                    throw new errors_1.NotFoundError('Estudiante no encontrado');
                }
                // Verificar que el estudiante esté asignado a este SLP
                if (((_b = (_a = student.child) === null || _a === void 0 ? void 0 : _a.currentSLP) === null || _b === void 0 ? void 0 : _b.toString()) !== slpId.toString()) {
                    throw new errors_1.ValidationError('El estudiante no está asignado a este SLP');
                }
                return [4 /*yield*/, TherapySession_1.TherapySession.countDocuments({
                        childId: studentId,
                        status: { $in: ['scheduled', 'in_progress'] }
                    })];
            case 2:
                activeSessions = _c.sent();
                if (activeSessions > 0) {
                    throw new errors_1.ValidationError('No se puede remover un estudiante con sesiones activas');
                }
                // Remover asignación
                student.child.currentSLP = null;
                return [4 /*yield*/, student.save()];
            case 3:
                _c.sent();
                // Decrementar contador del SLP
                return [4 /*yield*/, User_1.User.findByIdAndUpdate(slpId, {
                        $inc: { 'slp.caseloadCount': -1 }
                    })];
            case 4:
                // Decrementar contador del SLP
                _c.sent();
                (0, responseUtils_1.sendSuccessResponse)(res, student, 'Estudiante removido exitosamente');
                return [3 /*break*/, 6];
            case 5:
                error_8 = _c.sent();
                next(error_8);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.removeStudentFromSLP = removeStudentFromSLP;
