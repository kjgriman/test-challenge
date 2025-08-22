"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.invalidateToken = exports.refreshToken = exports.isSLP = exports.optionalAuth = exports.requireSessionAccess = exports.requireOwnership = exports.requireSLPOrChild = exports.requireChild = exports.requireSLP = exports.requireRole = exports.authenticate = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const errorHandler_1 = require("./errorHandler");
// Configuración del JWT
const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';
const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '24h';
// Función para generar token JWT
const generateToken = (user) => {
    const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
exports.generateToken = generateToken;
// Función para verificar token JWT
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new errorHandler_1.AuthenticationError('Token inválido o expirado');
    }
};
exports.verifyToken = verifyToken;
// Middleware principal de autenticación
const authenticate = async (req, _res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AuthenticationError('Token de autenticación requerido');
        }
        const token = authHeader.substring(7); // Remover 'Bearer ' del inicio
        req.token = token;
        // Verificar y decodificar el token
        const decoded = (0, exports.verifyToken)(token);
        // Buscar usuario en la base de datos
        const user = await User_1.User.findById(decoded.userId).select('-password');
        if (!user) {
            // Usuario no encontrado - probablemente de base de datos local
            const error = new errorHandler_1.AuthenticationError('Usuario no encontrado - Sesión expirada');
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
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
// Middleware para verificar rol específico
const requireRole = (roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new errorHandler_1.AuthenticationError('Usuario no autenticado');
        }
        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!allowedRoles.includes(userRole)) {
            throw new errorHandler_1.AuthorizationError(`Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`);
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
const requireOwnership = (resourceField = 'userId') => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new errorHandler_1.AuthenticationError('Usuario no autenticado');
        }
        const resourceId = req.params[resourceField] || req.body[resourceField];
        if (!resourceId) {
            throw new errorHandler_1.AuthorizationError('ID del recurso requerido');
        }
        // SLP pueden acceder a recursos de sus estudiantes
        if (req.user.role === User_1.UserRole.SLP) {
            const hasAccess = req.user.slp?.caseload?.includes(resourceId);
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
const requireSessionAccess = async (req, _res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AuthenticationError('Usuario no autenticado');
        }
        const sessionId = req.params['sessionId'] || req.body['sessionId'];
        if (!sessionId) {
            throw new errorHandler_1.AuthorizationError('ID de sesión requerido');
        }
        // Importar el modelo de sesión aquí para evitar dependencias circulares
        const { TherapySession } = await Promise.resolve().then(() => __importStar(require('../models/TherapySession')));
        const session = await TherapySession.findById(sessionId);
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
    }
    catch (error) {
        next(error);
    }
};
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
const optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // Continuar sin usuario autenticado
        }
        const token = authHeader.substring(7);
        const decoded = (0, exports.verifyToken)(token);
        const user = await User_1.User.findById(decoded.userId).select('-password');
        if (user && decoded.role === user.role) {
            req.user = user;
            req.token = token;
        }
        next();
    }
    catch (error) {
        // Si hay error en el token, continuar sin usuario autenticado
        next();
    }
};
exports.optionalAuth = optionalAuth;
// Middleware para verificar si el usuario es SLP
const isSLP = (req, _res, next) => {
    if (req.user && req.user.role === 'slp') {
        next();
    }
    else {
        throw new errorHandler_1.AuthenticationError('Acceso denegado - Solo para SLP');
    }
};
exports.isSLP = isSLP;
// Función para refrescar token
const refreshToken = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AuthenticationError('Usuario no autenticado');
        }
        // Generar nuevo token
        const newToken = (0, exports.generateToken)(req.user);
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
};
exports.refreshToken = refreshToken;
// Función para invalidar token (logout)
const invalidateToken = async (req, res, next) => {
    try {
        if (!req.token) {
            throw new errorHandler_1.AuthenticationError('No hay token para invalidar');
        }
        // En una implementación más robusta, podrías agregar el token a una blacklist
        // Por ahora, solo respondemos que se invalidó exitosamente
        console.log('🔓 Usuario deslogueado:', {
            userId: req.user?._id,
            email: req.user?.email,
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
};
exports.invalidateToken = invalidateToken;
// Función para obtener información del usuario autenticado
const getCurrentUser = async (req, res, _next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AuthenticationError('Usuario no autenticado');
        }
        res.json({
            success: true,
            data: {
                user: {
                    id: req.user._id,
                    email: req.user.email,
                    role: req.user.role,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    profilePicture: req.user.profilePicture,
                    ...(req.user.role === User_1.UserRole.SLP && {
                        slp: {
                            licenseNumber: req.user.slp.licenseNumber,
                            specialization: req.user.slp.specialization,
                            yearsOfExperience: req.user.slp.yearsOfExperience
                        }
                    }),
                    ...(req.user.role === User_1.UserRole.CHILD && {
                        child: {
                            skillLevel: req.user.child.skillLevel,
                            primaryGoals: req.user.child.primaryGoals,
                            sessionsCompleted: req.user.child.sessionsCompleted
                        }
                    })
                }
            }
        });
    }
    catch (error) {
        _next(error);
    }
};
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=auth.js.map