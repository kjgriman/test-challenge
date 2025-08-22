"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendErrorResponse = exports.sendSuccessResponse = void 0;
// Función para enviar respuestas exitosas
const sendSuccessResponse = (res, data, message = 'Operación exitosa', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};
exports.sendSuccessResponse = sendSuccessResponse;
// Función para enviar respuestas de error
const sendErrorResponse = (res, message, statusCode = 500, error) => {
    res.status(statusCode).json({
        success: false,
        message,
        error: process.env['NODE_ENV'] === 'development' ? error : undefined,
        timestamp: new Date().toISOString()
    });
};
exports.sendErrorResponse = sendErrorResponse;
//# sourceMappingURL=responseUtils.js.map