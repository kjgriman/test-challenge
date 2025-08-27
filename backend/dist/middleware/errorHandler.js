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
exports.setupGlobalErrorHandlers = exports.sendSuccessResponse = exports.sendErrorResponse = exports.asyncErrorHandler = exports.unhandledRejectionHandler = exports.unhandledErrorHandler = exports.errorHandler = exports.createMongooseCastError = exports.createMongooseDuplicateError = exports.createMongooseValidationError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.OperationalError = void 0;
// Clase para errores operacionales
var OperationalError = /** @class */ (function (_super) {
    __extends(OperationalError, _super);
    function OperationalError(message, statusCode, code) {
        if (statusCode === void 0) { statusCode = 500; }
        if (code === void 0) { code = 'INTERNAL_ERROR'; }
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.isOperational = true;
        _this.code = code;
        // Mantener el stack trace
        Error.captureStackTrace(_this, _this.constructor);
        return _this;
    }
    return OperationalError;
}(Error));
exports.OperationalError = OperationalError;
// Clase para errores de validación
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message, code) {
        if (code === void 0) { code = 'VALIDATION_ERROR'; }
        return _super.call(this, message, 400, code) || this;
    }
    return ValidationError;
}(OperationalError));
exports.ValidationError = ValidationError;
// Clase para errores de autenticación
var AuthenticationError = /** @class */ (function (_super) {
    __extends(AuthenticationError, _super);
    function AuthenticationError(message, code) {
        if (message === void 0) { message = 'No autorizado'; }
        if (code === void 0) { code = 'AUTHENTICATION_ERROR'; }
        return _super.call(this, message, 401, code) || this;
    }
    return AuthenticationError;
}(OperationalError));
exports.AuthenticationError = AuthenticationError;
// Clase para errores de autorización
var AuthorizationError = /** @class */ (function (_super) {
    __extends(AuthorizationError, _super);
    function AuthorizationError(message, code) {
        if (message === void 0) { message = 'Acceso denegado'; }
        if (code === void 0) { code = 'AUTHORIZATION_ERROR'; }
        return _super.call(this, message, 403, code) || this;
    }
    return AuthorizationError;
}(OperationalError));
exports.AuthorizationError = AuthorizationError;
// Clase para errores de recurso no encontrado
var NotFoundError = /** @class */ (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError(message, code) {
        if (message === void 0) { message = 'Recurso no encontrado'; }
        if (code === void 0) { code = 'NOT_FOUND_ERROR'; }
        return _super.call(this, message, 404, code) || this;
    }
    return NotFoundError;
}(OperationalError));
exports.NotFoundError = NotFoundError;
// Clase para errores de conflicto
var ConflictError = /** @class */ (function (_super) {
    __extends(ConflictError, _super);
    function ConflictError(message, code) {
        if (code === void 0) { code = 'CONFLICT_ERROR'; }
        return _super.call(this, message, 409, code) || this;
    }
    return ConflictError;
}(OperationalError));
exports.ConflictError = ConflictError;
// Clase para errores de límite de tasa
var RateLimitError = /** @class */ (function (_super) {
    __extends(RateLimitError, _super);
    function RateLimitError(message, code) {
        if (message === void 0) { message = 'Demasiadas solicitudes'; }
        if (code === void 0) { code = 'RATE_LIMIT_ERROR'; }
        return _super.call(this, message, 429, code) || this;
    }
    return RateLimitError;
}(OperationalError));
exports.RateLimitError = RateLimitError;
// Función para crear errores de validación de Mongoose
var createMongooseValidationError = function (error) {
    var messages = Object.values(error.errors).map(function (err) { return err.message; });
    return new ValidationError(messages.join(', '), 'MONGOOSE_VALIDATION_ERROR');
};
exports.createMongooseValidationError = createMongooseValidationError;
// Función para crear errores de duplicación de Mongoose
var createMongooseDuplicateError = function (error) {
    var field = Object.keys(error.keyPattern)[0];
    var keyValue = error.keyValue;
    var value = keyValue && field && keyValue[field] ? keyValue[field] : 'valor';
    return new ConflictError("".concat(field, " '").concat(value, "' ya existe"), 'MONGOOSE_DUPLICATE_ERROR');
};
exports.createMongooseDuplicateError = createMongooseDuplicateError;
// Función para crear errores de cast de Mongoose
var createMongooseCastError = function (error) {
    return new ValidationError("ID inv\u00E1lido: ".concat(error.value), 'MONGOOSE_CAST_ERROR');
};
exports.createMongooseCastError = createMongooseCastError;
// Middleware principal de manejo de errores
var errorHandler = function (error, req, res, _next) {
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
    var statusCode = error.statusCode || 500;
    // Determinar si es un error operacional
    var isOperational = error.isOperational || false;
    // Determinar el código de error
    var errorCode = error.code || 'INTERNAL_ERROR';
    // Crear respuesta de error
    var errorResponse = __assign({ success: false, error: __assign({ message: isOperational ? error.message : 'Error interno del servidor', code: errorCode }, (process.env['NODE_ENV'] === 'development' && {
            stack: error.stack,
            details: error.message
        })), timestamp: new Date().toISOString(), path: req.path, method: req.method }, (errorCode === 'USER_NOT_FOUND' && {
        shouldRedirect: true
    }));
    // Enviar respuesta
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
// Middleware para capturar errores no manejados
var unhandledErrorHandler = function (error) {
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
var unhandledRejectionHandler = function (reason, promise) {
    console.error('🚫 Promesa rechazada no manejada:', {
        reason: reason,
        promise: promise,
        timestamp: new Date().toISOString()
    });
    // En producción, podrías enviar el error a un servicio de monitoreo
    process.exit(1);
};
exports.unhandledRejectionHandler = unhandledRejectionHandler;
// Middleware para manejar errores de async/await
var asyncErrorHandler = function (fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncErrorHandler = asyncErrorHandler;
// Función para enviar respuestas de error consistentes
var sendErrorResponse = function (res, statusCode, message, code) {
    if (code === void 0) { code = 'CUSTOM_ERROR'; }
    res.status(statusCode).json({
        success: false,
        error: {
            message: message,
            code: code,
            timestamp: new Date().toISOString()
        }
    });
};
exports.sendErrorResponse = sendErrorResponse;
// Función para enviar respuestas de éxito consistentes
var sendSuccessResponse = function (res, data, message, statusCode) {
    if (message === void 0) { message = 'Operación exitosa'; }
    if (statusCode === void 0) { statusCode = 200; }
    res.status(statusCode).json({
        success: true,
        message: message,
        data: data,
        timestamp: new Date().toISOString()
    });
};
exports.sendSuccessResponse = sendSuccessResponse;
// Configurar handlers globales para errores no capturados
var setupGlobalErrorHandlers = function () {
    process.on('uncaughtException', exports.unhandledErrorHandler);
    process.on('unhandledRejection', exports.unhandledRejectionHandler);
};
exports.setupGlobalErrorHandlers = setupGlobalErrorHandlers;
