"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const rateLimiter_1 = require("../middleware/rateLimiter");
const errorHandler_1 = require("../middleware/errorHandler");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Middleware de validación para registro
const validateSLPRegistration = [
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
const validateChildRegistration = [
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
const validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
];
const validatePasswordChange = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('La contraseña actual es requerida'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6 })
        .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];
const validateForgotPassword = [
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
exports.default = router;
//# sourceMappingURL=auth.js.map