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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRateLimitAttempt = exports.getRateLimitInfo = exports.dynamicRateLimiter = exports.gameRateLimiter = exports.sessionRateLimiter = exports.wsRateLimiter = exports.authRateLimiter = exports.rateLimiter = void 0;
var express_rate_limit_1 = require("express-rate-limit");
// Configuración de rate limiting para diferentes endpoints
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env['NODE_ENV'] === 'development' ? 1000 : 100, // Más permisivo en desarrollo
    message: {
        success: false,
        error: {
            message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos',
            code: 'RATE_LIMIT_EXCEEDED',
            timestamp: new Date().toISOString()
        }
    },
    standardHeaders: true, // Incluir headers estándar de rate limit
    legacyHeaders: false, // No incluir headers legacy
    handler: function (req, res) {
        // Log del rate limit excedido para monitoreo
        console.warn('⚠️ Rate limit excedido:', {
            ip: req.ip,
            url: req.url,
            method: req.method,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });
        res.status(429).json({
            success: false,
            error: {
                message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos',
                code: 'RATE_LIMIT_EXCEEDED',
                timestamp: new Date().toISOString()
            }
        });
    },
    // Función para generar la clave del rate limit
    keyGenerator: function (req) {
        // Usar IP del usuario como clave principal
        return req.ip || req.connection.remoteAddress || 'unknown';
    },
    // Función para saltar ciertas rutas del rate limiting
    skip: function (req) {
        // Saltar health checks y endpoints de monitoreo
        return req.path === '/health' || req.path === '/metrics';
    }
});
// Rate limiter más estricto para autenticación
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env['NODE_ENV'] === 'development' ? 50 : 5, // Más permisivo en desarrollo
    message: {
        success: false,
        error: {
            message: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos',
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            timestamp: new Date().toISOString()
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: function (req, res) {
        console.warn('🔒 Rate limit de autenticación excedido:', {
            ip: req.ip,
            url: req.url,
            timestamp: new Date().toISOString()
        });
        res.status(429).json({
            success: false,
            error: {
                message: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos',
                code: 'AUTH_RATE_LIMIT_EXCEEDED',
                timestamp: new Date().toISOString()
            }
        });
    },
    keyGenerator: function (req) {
        return req.ip || req.connection.remoteAddress || 'unknown';
    },
    // Aplicar solo a rutas de autenticación
    skip: function (req) {
        return !req.path.includes('/auth');
    }
});
// Rate limiter para WebSocket connections
exports.wsRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // Máximo 10 conexiones WebSocket por minuto
    message: {
        success: false,
        error: {
            message: 'Demasiadas conexiones WebSocket, intenta de nuevo en 1 minuto',
            code: 'WS_RATE_LIMIT_EXCEEDED',
            timestamp: new Date().toISOString()
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: function (req, res) {
        console.warn('📡 Rate limit de WebSocket excedido:', {
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        res.status(429).json({
            success: false,
            error: {
                message: 'Demasiadas conexiones WebSocket, intenta de nuevo en 1 minuto',
                code: 'WS_RATE_LIMIT_EXCEEDED',
                timestamp: new Date().toISOString()
            }
        });
    },
    keyGenerator: function (req) {
        return req.ip || req.connection.remoteAddress || 'unknown';
    }
});
// Rate limiter para creación de sesiones
exports.sessionRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // Máximo 10 sesiones creadas por hora
    message: {
        success: false,
        error: {
            message: 'Demasiadas sesiones creadas, intenta de nuevo en 1 hora',
            code: 'SESSION_RATE_LIMIT_EXCEEDED',
            timestamp: new Date().toISOString()
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: function (req, res) {
        var _a;
        console.warn('📅 Rate limit de sesiones excedido:', {
            ip: req.ip,
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'unknown',
            timestamp: new Date().toISOString()
        });
        res.status(429).json({
            success: false,
            error: {
                message: 'Demasiadas sesiones creadas, intenta de nuevo en 1 hora',
                code: 'SESSION_RATE_LIMIT_EXCEEDED',
                timestamp: new Date().toISOString()
            }
        });
    },
    keyGenerator: function (req) {
        var _a;
        // Usar ID del usuario si está autenticado, sino IP
        return ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.ip || req.connection.remoteAddress || 'unknown';
    },
    // Aplicar solo a rutas de sesiones
    skip: function (req) {
        return !req.path.includes('/sessions');
    }
});
// Rate limiter para juegos
exports.gameRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 60, // Máximo 60 acciones de juego por minuto
    message: {
        success: false,
        error: {
            message: 'Demasiadas acciones de juego, intenta de nuevo en 1 minuto',
            code: 'GAME_RATE_LIMIT_EXCEEDED',
            timestamp: new Date().toISOString()
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: function (req, res) {
        var _a;
        console.warn('🎮 Rate limit de juegos excedido:', {
            ip: req.ip,
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'unknown',
            timestamp: new Date().toISOString()
        });
        res.status(429).json({
            success: false,
            error: {
                message: 'Demasiadas acciones de juego, intenta de nuevo en 1 minuto',
                code: 'GAME_RATE_LIMIT_EXCEEDED',
                timestamp: new Date().toISOString()
            }
        });
    },
    keyGenerator: function (req) {
        var _a;
        return ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.ip || req.connection.remoteAddress || 'unknown';
    },
    // Aplicar solo a rutas de juegos
    skip: function (req) {
        return !req.path.includes('/games');
    }
});
// Middleware para aplicar rate limiting dinámico basado en el rol del usuario
var dynamicRateLimiter = function (req, res, next) {
    // Aplicar rate limiting más estricto para usuarios no autenticados
    if (!req.user) {
        return (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 50
        })(req, res, next);
    }
    // Aplicar rate limiting basado en el rol
    var userRole = req.user.role;
    if (userRole === 'slp') {
        // SLP tienen límites más altos
        return (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 200
        })(req, res, next);
    }
    else if (userRole === 'child') {
        // Niños tienen límites más bajos para prevenir abuso
        return (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 100
        })(req, res, next);
    }
    // Rate limiting por defecto
    next();
};
exports.dynamicRateLimiter = dynamicRateLimiter;
// Función para obtener información del rate limit
var getRateLimitInfo = function (req) {
    var _a, _b;
    var ip = req.ip || req.connection.remoteAddress || 'unknown';
    var userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'anonymous';
    return {
        ip: ip,
        userId: userId,
        userRole: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || 'anonymous',
        timestamp: new Date().toISOString()
    };
};
exports.getRateLimitInfo = getRateLimitInfo;
// Función para loggear intentos de rate limit
var logRateLimitAttempt = function (req, endpoint) {
    var info = (0, exports.getRateLimitInfo)(req);
    console.log('📊 Rate limit attempt:', __assign(__assign({}, info), { endpoint: endpoint, userAgent: req.get('User-Agent') }));
};
exports.logRateLimitAttempt = logRateLimitAttempt;
