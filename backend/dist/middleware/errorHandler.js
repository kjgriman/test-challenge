"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGlobalErrorHandlers = exports.sendSuccessResponse = exports.sendErrorResponse = exports.asyncErrorHandler = exports.unhandledRejectionHandler = exports.unhandledErrorHandler = exports.errorHandler = exports.createMongooseCastError = exports.createMongooseDuplicateError = exports.createMongooseValidationError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.OperationalError = void 0;
// Clase para errores operacionales
class OperationalError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.code = code;
        // Mantener el stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.OperationalError = OperationalError;
// Clase para errores de validación
class ValidationError extends OperationalError {
    constructor(message, code = 'VALIDATION_ERROR') {
        super(message, 400, code);
    }
}
exports.ValidationError = ValidationError;
// Clase para errores de autenticación
class AuthenticationError extends OperationalError {
    constructor(message = 'No autorizado', code = 'AUTHENTICATION_ERROR') {
        super(message, 401, code);
    }
}
exports.AuthenticationError = AuthenticationError;
// Clase para errores de autorización
class AuthorizationError extends OperationalError {
    constructor(message = 'Acceso denegado', code = 'AUTHORIZATION_ERROR') {
        super(message, 403, code);
    }
}
exports.AuthorizationError = AuthorizationError;
// Clase para errores de recurso no encontrado
class NotFoundError extends OperationalError {
    constructor(message = 'Recurso no encontrado', code = 'NOT_FOUND_ERROR') {
        super(message, 404, code);
    }
}
exports.NotFoundError = NotFoundError;
// Clase para errores de conflicto
class ConflictError extends OperationalError {
    constructor(message, code = 'CONFLICT_ERROR') {
        super(message, 409, code);
    }
}
exports.ConflictError = ConflictError;
// Clase para errores de límite de tasa
class RateLimitError extends OperationalError {
    constructor(message = 'Demasiadas solicitudes', code = 'RATE_LIMIT_ERROR') {
        super(message, 429, code);
    }
}
exports.RateLimitError = RateLimitError;
// Función para crear errores de validación de Mongoose
const createMongooseValidationError = (error) => {
    const messages = Object.values(error.errors).map((err) => err.message);
    return new ValidationError(messages.join(', '), 'MONGOOSE_VALIDATION_ERROR');
};
exports.createMongooseValidationError = createMongooseValidationError;
// Función para crear errores de duplicación de Mongoose
const createMongooseDuplicateError = (error) => {
    const field = Object.keys(error.keyPattern)[0];
    const keyValue = error.keyValue;
    const value = keyValue && field && keyValue[field] ? keyValue[field] : 'valor';
    return new ConflictError(`${field} '${value}' ya existe`, 'MONGOOSE_DUPLICATE_ERROR');
};
exports.createMongooseDuplicateError = createMongooseDuplicateError;
// Función para crear errores de cast de Mongoose
const createMongooseCastError = (error) => {
    return new ValidationError(`ID inválido: ${error.value}`, 'MONGOOSE_CAST_ERROR');
};
exports.createMongooseCastError = createMongooseCastError;
// Middleware principal de manejo de errores
const errorHandler = (error, req, res, _next) => {
    // Log del error para debugging
    console.error('🚨 Error Handler:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    // Determinar el código de estado
    const statusCode = error.statusCode || 500;
    // Determinar si es un error operacional
    const isOperational = error.isOperational || false;
    // Determinar el código de error
    const errorCode = error.code || 'INTERNAL_ERROR';
    // Crear respuesta de error
    const errorResponse = {
        success: false,
        error: {
            message: isOperational ? error.message : 'Error interno del servidor',
            code: errorCode,
            ...(process.env['NODE_ENV'] === 'development' && {
                stack: error.stack,
                details: error.message
            })
        },
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        // Agregar flag para redirección si es usuario no encontrado
        ...(errorCode === 'USER_NOT_FOUND' && {
            shouldRedirect: true
        })
    };
    // Enviar respuesta
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
// Middleware para capturar errores no manejados
const unhandledErrorHandler = (error) => {
    console.error('💥 Error no manejado:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    // En producción, podrías enviar el error a un servicio de monitoreo
    // como Sentry, LogRocket, etc.
    process.exit(1);
};
exports.unhandledErrorHandler = unhandledErrorHandler;
// Middleware para capturar promesas rechazadas
const unhandledRejectionHandler = (reason, promise) => {
    console.error('🚫 Promesa rechazada no manejada:', {
        reason,
        promise,
        timestamp: new Date().toISOString()
    });
    // En producción, podrías enviar el error a un servicio de monitoreo
    process.exit(1);
};
exports.unhandledRejectionHandler = unhandledRejectionHandler;
// Middleware para manejar errores de async/await
const asyncErrorHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncErrorHandler = asyncErrorHandler;
// Función para enviar respuestas de error consistentes
const sendErrorResponse = (res, statusCode, message, code = 'CUSTOM_ERROR') => {
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code,
            timestamp: new Date().toISOString()
        }
    });
};
exports.sendErrorResponse = sendErrorResponse;
// Función para enviar respuestas de éxito consistentes
const sendSuccessResponse = (res, data, message = 'Operación exitosa', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};
exports.sendSuccessResponse = sendSuccessResponse;
// Configurar handlers globales para errores no capturados
const setupGlobalErrorHandlers = () => {
    process.on('uncaughtException', exports.unhandledErrorHandler);
    process.on('unhandledRejection', exports.unhandledRejectionHandler);
};
exports.setupGlobalErrorHandlers = setupGlobalErrorHandlers;
//# sourceMappingURL=errorHandler.js.map