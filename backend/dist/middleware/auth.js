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
exports.getCurrentUser = exports.invalidateToken = exports.refreshToken = exports.isSLP = exports.optionalAuth = exports.requireSessionAccess = exports.requireOwnership = exports.requireSLPOrChild = exports.requireChild = exports.requireSLP = exports.requireRole = exports.authenticate = exports.verifyToken = exports.generateToken = void 0;
var jwt = require("jsonwebtoken");
var User_1 = require("../models/User");
var errorHandler_1 = require("./errorHandler");
// Configuración del JWT
var JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';
var JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '24h';
// Función para generar token JWT
var generateToken = function (user) {
    var payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
exports.generateToken = generateToken;
// Función para verificar token JWT
var verifyToken = function (token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new errorHandler_1.AuthenticationError('Token inválido o expirado');
    }
};
exports.verifyToken = verifyToken;
// Middleware principal de autenticación
var authenticate = function (req, _res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var authHeader, token, decoded, user, error, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    throw new errorHandler_1.AuthenticationError('Token de autenticación requerido');
                }
                token = authHeader.substring(7);
                req.token = token;
                decoded = (0, exports.verifyToken)(token);
                return [4 /*yield*/, User_1.User.findById(decoded.userId).select('-password')];
            case 1:
                user = _a.sent();
                if (!user) {
                    error = new errorHandler_1.AuthenticationError('Usuario no encontrado - Sesión expirada');
                    error.code = 'USER_NOT_FOUND';
                    error.shouldRedirect = true;
                    throw error;
                }
                // Verificar que el rol del token coincida con el rol del usuario
                if (decoded.role !== user.role) {
                    throw new errorHandler_1.AuthenticationError('Token inválido: rol no coincide');
                }
                // Agregar usuario a la request
                req.user = user;
                // Log de autenticación exitosa
                console.log('🔐 Usuario autenticado:', {
                    userId: user._id,
                    email: user.email,
                    role: user.role,
                    ip: req.ip,
                    timestamp: new Date().toISOString()
                });
                next();
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                next(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.authenticate = authenticate;
// Middleware para verificar rol específico
var requireRole = function (roles) {
    return function (req, _res, next) {
        if (!req.user) {
            throw new errorHandler_1.AuthenticationError('Usuario no autenticado');
        }
        var userRole = req.user.role;
        var allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!allowedRoles.includes(userRole)) {
            throw new errorHandler_1.AuthorizationError("Acceso denegado. Roles permitidos: ".concat(allowedRoles.join(', ')));
        }
        next();
    };
};
exports.requireRole = requireRole;
// Middleware para verificar que el usuario sea SLP
exports.requireSLP = (0, exports.requireRole)(User_1.UserRole.SLP);
// Middleware para verificar que el usuario sea Child
exports.requireChild = (0, exports.requireRole)(User_1.UserRole.CHILD);
// Middleware para verificar que el usuario sea SLP o Child
exports.requireSLPOrChild = (0, exports.requireRole)([User_1.UserRole.SLP, User_1.UserRole.CHILD]);
// Middleware para verificar propiedad del recurso
var requireOwnership = function (resourceField) {
    if (resourceField === void 0) { resourceField = 'userId'; }
    return function (req, _res, next) {
        var _a, _b;
        if (!req.user) {
            throw new errorHandler_1.AuthenticationError('Usuario no autenticado');
        }
        var resourceId = req.params[resourceField] || req.body[resourceField];
        if (!resourceId) {
            throw new errorHandler_1.AuthorizationError('ID del recurso requerido');
        }
        // SLP pueden acceder a recursos de sus estudiantes
        if (req.user.role === User_1.UserRole.SLP) {
            var hasAccess = (_b = (_a = req.user.slp) === null || _a === void 0 ? void 0 : _a.caseload) === null || _b === void 0 ? void 0 : _b.includes(resourceId);
            if (!hasAccess && req.user._id.toString() !== resourceId) {
                throw new errorHandler_1.AuthorizationError('Acceso denegado al recurso');
            }
        }
        else {
            // Child solo puede acceder a sus propios recursos
            if (req.user._id.toString() !== resourceId) {
                throw new errorHandler_1.AuthorizationError('Acceso denegado al recurso');
            }
        }
        next();
    };
};
exports.requireOwnership = requireOwnership;
// Middleware para verificar acceso a sesión
var requireSessionAccess = function (req, _res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, TherapySession, session, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                if (!req.user) {
                    throw new errorHandler_1.AuthenticationError('Usuario no autenticado');
                }
                sessionId = req.params['sessionId'] || req.body['sessionId'];
                if (!sessionId) {
                    throw new errorHandler_1.AuthorizationError('ID de sesión requerido');
                }
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../models/TherapySession'); })];
            case 1:
                TherapySession = (_a.sent()).TherapySession;
                return [4 /*yield*/, TherapySession.findById(sessionId)];
            case 2:
                session = _a.sent();
                if (!session) {
                    throw new errorHandler_1.AuthorizationError('Sesión no encontrada');
                }
                // Verificar acceso basado en el rol
                if (req.user.role === User_1.UserRole.SLP) {
                    if (session.slpId.toString() !== req.user._id.toString()) {
                        throw new errorHandler_1.AuthorizationError('Acceso denegado a la sesión');
                    }
                }
                else if (req.user.role === User_1.UserRole.CHILD) {
                    if (session.childId.toString() !== req.user._id.toString()) {
                        throw new errorHandler_1.AuthorizationError('Acceso denegado a la sesión');
                    }
                }
                // Agregar la sesión a la request para uso posterior
                req.session = session;
                next();
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                next(error_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.requireSessionAccess = requireSessionAccess;
// Middleware para verificar acceso a juego (temporalmente deshabilitado)
// export const requireGameAccess = async (
//   req: Request,
//   _res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     if (!req.user) {
//       throw new AuthenticationError('Usuario no autenticado');
//     }
//     
//     const gameId = req.params['gameId'] || req.body['gameId'];
//     
//     if (!gameId) {
//       throw new AuthorizationError('ID de juego requerido');
//     }
//     
//     // Importar el modelo de juego aquí para evitar dependencias circulares
//     // const { Game } = await import('../models/Game');
//     
//     const game = await Game.findById(gameId);
//     
//     if (!game) {
//       throw new AuthorizationError('Juego no encontrado');
//     }
//     
//     // Verificar acceso basado en el rol
//     if (req.user.role === UserRole.SLP) {
//       if (game.slpId.toString() !== req.user._id.toString()) {
//         throw new AuthorizationError('Acceso denegado al juego');
//       }
//     } else if (req.user.role === UserRole.CHILD) {
//       if (game.childId.toString() !== req.user._id.toString()) {
//         throw new AuthorizationError('Acceso denegado al juego');
//       }
//     }
//     
//     // Agregar el juego a la request para uso posterior
//     (req as any).game = game;
//     
//     next();
//   } catch (error) {
//     next(error);
//   }
// };
// Middleware opcional de autenticación (no falla si no hay token)
var optionalAuth = function (req, _res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var authHeader, token, decoded, user, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return [2 /*return*/, next()]; // Continuar sin usuario autenticado
                }
                token = authHeader.substring(7);
                decoded = (0, exports.verifyToken)(token);
                return [4 /*yield*/, User_1.User.findById(decoded.userId).select('-password')];
            case 1:
                user = _a.sent();
                if (user && decoded.role === user.role) {
                    req.user = user;
                    req.token = token;
                }
                next();
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                // Si hay error en el token, continuar sin usuario autenticado
                next();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.optionalAuth = optionalAuth;
// Middleware para verificar si el usuario es SLP
var isSLP = function (req, _res, next) {
    if (req.user && req.user.role === 'slp') {
        next();
    }
    else {
        throw new errorHandler_1.AuthenticationError('Acceso denegado - Solo para SLP');
    }
};
exports.isSLP = isSLP;
// Función para refrescar token
var refreshToken = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var newToken;
    return __generator(this, function (_a) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AuthenticationError('Usuario no autenticado');
            }
            newToken = (0, exports.generateToken)(req.user);
            res.json({
                success: true,
                message: 'Token refrescado exitosamente',
                data: {
                    token: newToken,
                    user: {
                        id: req.user._id,
                        email: req.user.email,
                        role: req.user.role,
                        firstName: req.user.firstName,
                        lastName: req.user.lastName
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.refreshToken = refreshToken;
// Función para invalidar token (logout)
var invalidateToken = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        try {
            if (!req.token) {
                throw new errorHandler_1.AuthenticationError('No hay token para invalidar');
            }
            // En una implementación más robusta, podrías agregar el token a una blacklist
            // Por ahora, solo respondemos que se invalidó exitosamente
            console.log('🔓 Usuario deslogueado:', {
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                email: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email,
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            res.json({
                success: true,
                message: 'Sesión cerrada exitosamente'
            });
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.invalidateToken = invalidateToken;
// Función para obtener información del usuario autenticado
var getCurrentUser = function (req, res, _next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AuthenticationError('Usuario no autenticado');
            }
            res.json({
                success: true,
                data: {
                    user: __assign(__assign({ id: req.user._id, email: req.user.email, role: req.user.role, firstName: req.user.firstName, lastName: req.user.lastName, profilePicture: req.user.profilePicture }, (req.user.role === User_1.UserRole.SLP && {
                        slp: {
                            licenseNumber: req.user.slp.licenseNumber,
                            specialization: req.user.slp.specialization,
                            yearsOfExperience: req.user.slp.yearsOfExperience
                        }
                    })), (req.user.role === User_1.UserRole.CHILD && {
                        child: {
                            skillLevel: req.user.child.skillLevel,
                            primaryGoals: req.user.child.primaryGoals,
                            sessionsCompleted: req.user.child.sessionsCompleted
                        }
                    }))
                }
            });
        }
        catch (error) {
            _next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.getCurrentUser = getCurrentUser;
