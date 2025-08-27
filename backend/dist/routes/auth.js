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
var express_1 = require("express");
var express_validator_1 = require("express-validator");
var rateLimiter_1 = require("../middleware/rateLimiter");
var errorHandler_1 = require("../middleware/errorHandler");
var authController_1 = require("../controllers/authController");
var auth_1 = require("../middleware/auth");
var User_1 = require("../models/User");
var router = (0, express_1.Router)();
// Middleware de validación para registro
var validateSLPRegistration = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
    (0, express_validator_1.body)('licenseNumber')
        .trim()
        .isLength({ min: 5, max: 20 })
        .withMessage('El número de licencia debe tener entre 5 y 20 caracteres'),
    (0, express_validator_1.body)('specialization')
        .isArray({ min: 1 })
        .withMessage('Debe especificar al menos una especialización'),
    (0, express_validator_1.body)('specialization.*')
        .isIn(['articulation', 'language', 'fluency', 'voice', 'swallowing', 'cognitive'])
        .withMessage('Especialización inválida'),
    (0, express_validator_1.body)('yearsOfExperience')
        .isInt({ min: 0, max: 50 })
        .withMessage('Los años de experiencia deben ser entre 0 y 50')
];
var validateChildRegistration = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
    (0, express_validator_1.body)('dateOfBirth')
        .isISO8601()
        .withMessage('Fecha de nacimiento inválida'),
    (0, express_validator_1.body)('parentEmail')
        .isEmail()
        .withMessage('Email del padre inválido')
        .normalizeEmail(),
    (0, express_validator_1.body)('skillLevel')
        .isIn(['beginner', 'intermediate', 'advanced'])
        .withMessage('Nivel de habilidad inválido'),
    (0, express_validator_1.body)('primaryGoals')
        .isArray({ min: 1, max: 5 })
        .withMessage('Debe especificar entre 1 y 5 objetivos'),
    (0, express_validator_1.body)('primaryGoals.*')
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Cada objetivo debe tener entre 10 y 200 caracteres')
];
var validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
];
var validatePasswordChange = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('La contraseña actual es requerida'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6 })
        .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];
var validateForgotPassword = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail()
];
// Rutas de autenticación
// POST /api/auth/register/slp - Registro de SLP
router.post('/register/slp', rateLimiter_1.authRateLimiter, validateSLPRegistration, (0, errorHandler_1.asyncErrorHandler)(authController_1.registerSLP));
// POST /api/auth/register/child - Registro de Child
router.post('/register/child', rateLimiter_1.authRateLimiter, validateChildRegistration, (0, errorHandler_1.asyncErrorHandler)(authController_1.registerChild));
// POST /api/auth/login - Login de usuario
router.post('/login', rateLimiter_1.authRateLimiter, validateLogin, (0, errorHandler_1.asyncErrorHandler)(authController_1.login));
// POST /api/auth/logout - Logout de usuario
router.post('/logout', auth_1.authenticate, (0, errorHandler_1.asyncErrorHandler)(authController_1.logout));
// GET /api/auth/verify - Verificar token
router.get('/verify', auth_1.authenticate, (0, errorHandler_1.asyncErrorHandler)(authController_1.verifyAuth));
// POST /api/auth/change-password - Cambiar contraseña
router.post('/change-password', auth_1.authenticate, validatePasswordChange, (0, errorHandler_1.asyncErrorHandler)(authController_1.changePassword));
// POST /api/auth/forgot-password - Solicitar recuperación de contraseña
router.post('/forgot-password', rateLimiter_1.authRateLimiter, validateForgotPassword, (0, errorHandler_1.asyncErrorHandler)(authController_1.forgotPassword));
// GET /api/auth/me - Obtener información del usuario actual
router.get('/me', auth_1.authenticate, (0, errorHandler_1.asyncErrorHandler)(auth_1.getCurrentUser));
// Endpoint para verificar usuarios (solo en desarrollo)
if (process.env['NODE_ENV'] === 'development') {
    router.get('/check-users', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var users, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, User_1.User.find({}).select('email firstName lastName role createdAt')];
                case 1:
                    users = _a.sent();
                    res.json({
                        success: true,
                        data: users
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    res.status(500).json({
                        success: false,
                        error: error_1 instanceof Error ? error_1.message : 'Error desconocido'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
}
exports.default = router;
