"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncErrorHandler = void 0;
// Middleware para manejar errores en funciones async
const asyncErrorHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncErrorHandler = asyncErrorHandler;
//# sourceMappingURL=asyncErrorHandler.js.map