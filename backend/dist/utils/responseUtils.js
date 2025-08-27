"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendErrorResponse = exports.sendSuccessResponse = void 0;
// Función para enviar respuestas exitosas
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
// Función para enviar respuestas de error
var sendErrorResponse = function (res, message, statusCode, error) {
    if (statusCode === void 0) { statusCode = 500; }
    res.status(statusCode).json({
        success: false,
        message: message,
        error: process.env['NODE_ENV'] === 'development' ? error : undefined,
        timestamp: new Date().toISOString()
    });
};
exports.sendErrorResponse = sendErrorResponse;
