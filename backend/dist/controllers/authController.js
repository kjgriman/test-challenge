"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.forgotPassword = exports.changePassword = exports.logout = exports.verifyAuth = exports.login = exports.registerChild = exports.registerSLP = void 0;
var jwt = require("jsonwebtoken");
var User_1 = require("../models/User");
var auth_1 = require("../middleware/auth");
var errorHandler_1 = require("../middleware/errorHandler");
var errorHandler_2 = require("../middleware/errorHandler");
// Función para validar datos de registro
var validateRegistrationData = function (data, role) {
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
        throw new errorHandler_2.ValidationError('Todos los campos básicos son requeridos');
    }
    if (data.password.length < 6) {
        throw new errorHandler_2.ValidationError('La contraseña debe tener al menos 6 caracteres');
    }
    if (role === User_1.UserRole.SLP) {
        if (!data.licenseNumber || !data.specialization || !data.yearsOfExperience) {
            throw new errorHandler_2.ValidationError('Todos los campos de SLP son requeridos');
        }
        if (data.yearsOfExperience < 0) {
            throw new errorHandler_2.ValidationError('Los años de experiencia no pueden ser negativos');
        }
    }
    if (role === User_1.UserRole.CHILD) {
        if (!data.parentEmail || !data.skillLevel || !data.primaryGoals) {
            throw new errorHandler_2.ValidationError('Todos los campos de Child son requeridos');
        }
        if (data.primaryGoals.length === 0) {
            throw new errorHandler_2.ValidationError('Debe especificar al menos un objetivo');
        }
    }
};
// Controlador para registro de SLP
var registerSLP = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var registrationData, existingUser, existingLicense, newSLP, savedSLP, token, error_1;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 4, , 5]);
                registrationData = req.body;
                // Validar datos de entrada
                validateRegistrationData(registrationData, User_1.UserRole.SLP);
                return [4 /*yield*/, User_1.User.findOne({ email: registrationData.email })];
            case 1:
                existingUser = _e.sent();
                if (existingUser) {
                    throw new errorHandler_2.ConflictError('El email ya está registrado');
                }
                return [4 /*yield*/, User_1.User.findOne({ 'slp.licenseNumber': registrationData.licenseNumber })];
            case 2:
                existingLicense = _e.sent();
                if (existingLicense) {
                    throw new errorHandler_2.ConflictError('El número de licencia ya está registrado');
                }
                newSLP = new User_1.User(__assign(__assign({}, registrationData), { role: User_1.UserRole.SLP, slp: {
                        licenseNumber: registrationData.licenseNumber,
                        specialization: registrationData.specialization,
                        yearsOfExperience: registrationData.yearsOfExperience,
                        caseload: []
                    } }));
                return [4 /*yield*/, newSLP.save()];
            case 3:
                savedSLP = _e.sent();
                token = (0, auth_1.generateToken)(savedSLP);
                // Log de registro exitoso
                console.log('✅ Nuevo SLP registrado:', {
                    userId: savedSLP._id,
                    email: savedSLP.email,
                    licenseNumber: (_a = savedSLP.slp) === null || _a === void 0 ? void 0 : _a.licenseNumber,
                    timestamp: new Date().toISOString()
                });
                // Enviar respuesta exitosa
                (0, errorHandler_1.sendSuccessResponse)(res, {
                    user: {
                        id: savedSLP._id,
                        email: savedSLP.email,
                        firstName: savedSLP.firstName,
                        lastName: savedSLP.lastName,
                        role: savedSLP.role,
                        slp: {
                            licenseNumber: (_b = savedSLP.slp) === null || _b === void 0 ? void 0 : _b.licenseNumber,
                            specialization: (_c = savedSLP.slp) === null || _c === void 0 ? void 0 : _c.specialization,
                            yearsOfExperience: (_d = savedSLP.slp) === null || _d === void 0 ? void 0 : _d.yearsOfExperience
                        }
                    },
                    token: token
                }, 'SLP registrado exitosamente', 201);
                return [3 /*break*/, 5];
            case 4:
                error_1 = _e.sent();
                next(error_1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.registerSLP = registerSLP;
// Controlador para registro de Child
var registerChild = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var registrationData, existingUser, existingParent, newChild, savedChild, token, error_2;
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 5, , 6]);
                registrationData = req.body;
                // Validar datos de entrada
                validateRegistrationData(registrationData, User_1.UserRole.CHILD);
                return [4 /*yield*/, User_1.User.findOne({ email: registrationData.email })];
            case 1:
                existingUser = _f.sent();
                if (existingUser) {
                    throw new errorHandler_2.ConflictError('El email ya está registrado');
                }
                if (!(registrationData.parentEmail !== registrationData.email)) return [3 /*break*/, 3];
                return [4 /*yield*/, User_1.User.findOne({ email: registrationData.parentEmail })];
            case 2:
                existingParent = _f.sent();
                if (!existingParent) {
                    console.warn('⚠️ Email de padre no encontrado en el sistema:', registrationData.parentEmail);
                }
                _f.label = 3;
            case 3:
                newChild = new User_1.User(__assign(__assign({}, registrationData), { role: User_1.UserRole.CHILD, child: {
                        parentEmail: registrationData.parentEmail,
                        skillLevel: registrationData.skillLevel,
                        primaryGoals: registrationData.primaryGoals,
                        sessionsCompleted: 0,
                        totalSessionTime: 0
                    } }));
                return [4 /*yield*/, newChild.save()];
            case 4:
                savedChild = _f.sent();
                token = (0, auth_1.generateToken)(savedChild);
                // Log de registro exitoso
                console.log('✅ Nuevo Child registrado:', {
                    userId: savedChild._id,
                    email: savedChild.email,
                    parentEmail: (_a = savedChild.child) === null || _a === void 0 ? void 0 : _a.parentEmail,
                    skillLevel: (_b = savedChild.child) === null || _b === void 0 ? void 0 : _b.skillLevel,
                    timestamp: new Date().toISOString()
                });
                // Enviar respuesta exitosa
                (0, errorHandler_1.sendSuccessResponse)(res, {
                    user: {
                        id: savedChild._id,
                        email: savedChild.email,
                        firstName: savedChild.firstName,
                        lastName: savedChild.lastName,
                        role: savedChild.role,
                        child: {
                            skillLevel: (_c = savedChild.child) === null || _c === void 0 ? void 0 : _c.skillLevel,
                            primaryGoals: (_d = savedChild.child) === null || _d === void 0 ? void 0 : _d.primaryGoals,
                            sessionsCompleted: (_e = savedChild.child) === null || _e === void 0 ? void 0 : _e.sessionsCompleted
                        }
                    },
                    token: token
                }, 'Child registrado exitosamente', 201);
                return [3 /*break*/, 6];
            case 5:
                error_2 = _f.sent();
                next(error_2);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.registerChild = registerChild;
// Controlador para login
var login = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, mockUser, token_1, user, isPasswordValid, token, error_3;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return __generator(this, function (_l) {
        switch (_l.label) {
            case 0:
                _l.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, password = _a.password;
                // Validar datos de entrada
                if (!email || !password) {
                    throw new errorHandler_2.ValidationError('Email y contraseña son requeridos');
                }
                // Modo mock para desarrollo sin MongoDB
                if (process.env['NODE_ENV'] === 'development' && process.env['USE_IN_MEMORY_DB'] === 'true') {
                    console.log('🔧 Modo mock: Login simulado');
                    mockUser = {
                        _id: 'mock-user-id',
                        email: 'kjgriman@gmail.com',
                        password: '$2b$12$mock.hash.for.development',
                        firstName: 'Kerbin',
                        lastName: 'Griman',
                        role: 'slp',
                        profilePicture: null,
                        slp: {
                            licenseNumber: '123456780',
                            specialization: ['language'],
                            yearsOfExperience: 9,
                            caseloadCount: 0
                        }
                    };
                    // Simular verificación de contraseña
                    if (email === 'kjgriman@gmail.com' && password === 'test123') {
                        token_1 = jwt.sign({
                            userId: mockUser._id,
                            email: mockUser.email,
                            role: mockUser.role
                        }, process.env['JWT_SECRET'] || 'fallback-secret', { expiresIn: process.env['JWT_EXPIRES_IN'] || '24h' });
                        res.status(200).json({
                            success: true,
                            message: 'Login exitoso',
                            data: {
                                user: {
                                    _id: mockUser._id,
                                    email: mockUser.email,
                                    firstName: mockUser.firstName,
                                    lastName: mockUser.lastName,
                                    role: mockUser.role,
                                    profilePicture: mockUser.profilePicture,
                                    slp: mockUser.slp
                                },
                                token: token_1
                            }
                        });
                        return [2 /*return*/];
                    }
                    else {
                        throw new errorHandler_2.AuthenticationError('Credenciales inválidas');
                    }
                }
                return [4 /*yield*/, User_1.User.findOne({ email: email })];
            case 1:
                user = _l.sent();
                if (!user) {
                    throw new errorHandler_2.AuthenticationError('Credenciales inválidas');
                }
                return [4 /*yield*/, user.comparePassword(password)];
            case 2:
                isPasswordValid = _l.sent();
                if (!isPasswordValid) {
                    throw new errorHandler_2.AuthenticationError('Credenciales inválidas');
                }
                token = (0, auth_1.generateToken)(user);
                // Log de login exitoso
                console.log('🔐 Usuario logueado:', {
                    userId: user._id,
                    email: user.email,
                    role: user.role,
                    ip: req.ip,
                    timestamp: new Date().toISOString()
                });
                // Enviar respuesta exitosa
                (0, errorHandler_1.sendSuccessResponse)(res, {
                    user: __assign(__assign({ id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, profilePicture: user.profilePicture }, (user.role === User_1.UserRole.SLP && {
                        slp: {
                            licenseNumber: (_b = user.slp) === null || _b === void 0 ? void 0 : _b.licenseNumber,
                            specialization: (_c = user.slp) === null || _c === void 0 ? void 0 : _c.specialization,
                            yearsOfExperience: (_d = user.slp) === null || _d === void 0 ? void 0 : _d.yearsOfExperience,
                            caseloadCount: ((_f = (_e = user.slp) === null || _e === void 0 ? void 0 : _e.caseload) === null || _f === void 0 ? void 0 : _f.length) || 0
                        }
                    })), (user.role === User_1.UserRole.CHILD && {
                        child: {
                            skillLevel: (_g = user.child) === null || _g === void 0 ? void 0 : _g.skillLevel,
                            primaryGoals: (_h = user.child) === null || _h === void 0 ? void 0 : _h.primaryGoals,
                            sessionsCompleted: (_j = user.child) === null || _j === void 0 ? void 0 : _j.sessionsCompleted,
                            totalSessionTime: (_k = user.child) === null || _k === void 0 ? void 0 : _k.totalSessionTime
                        }
                    })),
                    token: token
                }, 'Login exitoso');
                return [3 /*break*/, 4];
            case 3:
                error_3 = _l.sent();
                next(error_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
// Controlador para verificar token
var verifyAuth = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return __generator(this, function (_k) {
        try {
            if (!req.user) {
                throw new errorHandler_2.AuthenticationError('Usuario no autenticado');
            }
            // Enviar respuesta exitosa con información del usuario
            (0, errorHandler_1.sendSuccessResponse)(res, {
                user: __assign(__assign({ id: req.user._id, email: req.user.email, firstName: req.user.firstName, lastName: req.user.lastName, role: req.user.role, profilePicture: req.user.profilePicture }, (req.user.role === User_1.UserRole.SLP && {
                    slp: {
                        licenseNumber: (_a = req.user.slp) === null || _a === void 0 ? void 0 : _a.licenseNumber,
                        specialization: (_b = req.user.slp) === null || _b === void 0 ? void 0 : _b.specialization,
                        yearsOfExperience: (_c = req.user.slp) === null || _c === void 0 ? void 0 : _c.yearsOfExperience,
                        caseloadCount: ((_e = (_d = req.user.slp) === null || _d === void 0 ? void 0 : _d.caseload) === null || _e === void 0 ? void 0 : _e.length) || 0
                    }
                })), (req.user.role === User_1.UserRole.CHILD && {
                    child: {
                        skillLevel: (_f = req.user.child) === null || _f === void 0 ? void 0 : _f.skillLevel,
                        primaryGoals: (_g = req.user.child) === null || _g === void 0 ? void 0 : _g.primaryGoals,
                        sessionsCompleted: (_h = req.user.child) === null || _h === void 0 ? void 0 : _h.sessionsCompleted,
                        totalSessionTime: (_j = req.user.child) === null || _j === void 0 ? void 0 : _j.totalSessionTime
                    }
                }))
            }, 'Token válido');
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.verifyAuth = verifyAuth;
// Controlador para logout
var logout = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            if (!req.user) {
                throw new errorHandler_2.AuthenticationError('Usuario no autenticado');
            }
            // Log de logout
            console.log('🔓 Usuario deslogueado:', {
                userId: req.user._id,
                email: req.user.email,
                role: req.user.role,
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            // Enviar respuesta exitosa
            (0, errorHandler_1.sendSuccessResponse)(res, null, 'Logout exitoso');
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.logout = logout;
// Controlador para cambiar contraseña
var changePassword = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, currentPassword, newPassword, isCurrentPasswordValid, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                if (!req.user) {
                    throw new errorHandler_2.AuthenticationError('Usuario no autenticado');
                }
                _a = req.body, currentPassword = _a.currentPassword, newPassword = _a.newPassword;
                if (!currentPassword || !newPassword) {
                    throw new errorHandler_2.ValidationError('Contraseña actual y nueva son requeridas');
                }
                if (newPassword.length < 6) {
                    throw new errorHandler_2.ValidationError('La nueva contraseña debe tener al menos 6 caracteres');
                }
                return [4 /*yield*/, req.user.comparePassword(currentPassword)];
            case 1:
                isCurrentPasswordValid = _b.sent();
                if (!isCurrentPasswordValid) {
                    throw new errorHandler_2.AuthenticationError('Contraseña actual incorrecta');
                }
                // Actualizar contraseña
                req.user.password = newPassword;
                return [4 /*yield*/, req.user.save()];
            case 2:
                _b.sent();
                // Log de cambio de contraseña
                console.log('🔑 Contraseña cambiada:', {
                    userId: req.user._id,
                    email: req.user.email,
                    ip: req.ip,
                    timestamp: new Date().toISOString()
                });
                // Enviar respuesta exitosa
                (0, errorHandler_1.sendSuccessResponse)(res, null, 'Contraseña cambiada exitosamente');
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                next(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.changePassword = changePassword;
// Controlador para recuperar contraseña (futuro)
var forgotPassword = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var email, user, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                email = req.body.email;
                if (!email) {
                    throw new errorHandler_2.ValidationError('Email es requerido');
                }
                return [4 /*yield*/, User_1.User.findOne({ email: email })];
            case 1:
                user = _a.sent();
                if (!user) {
                    // Por seguridad, no revelar si el email existe o no
                    (0, errorHandler_1.sendSuccessResponse)(res, null, 'Si el email existe, se enviará un enlace de recuperación');
                    return [2 /*return*/];
                }
                // TODO: Implementar envío de email con token de recuperación
                console.log('📧 Solicitud de recuperación de contraseña:', {
                    email: email,
                    userId: user._id,
                    timestamp: new Date().toISOString()
                });
                // Enviar respuesta exitosa
                (0, errorHandler_1.sendSuccessResponse)(res, null, 'Si el email existe, se enviará un enlace de recuperación');
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                next(error_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.forgotPassword = forgotPassword;
