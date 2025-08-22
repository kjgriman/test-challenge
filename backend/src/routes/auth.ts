import { Router } from 'express';
import { body } from 'express-validator';
import { authRateLimiter } from '../middleware/rateLimiter';
import { asyncErrorHandler } from '../middleware/errorHandler';
import {
  registerSLP,
  registerChild,
  login,
  verifyAuth,
  logout,
  changePassword,
  forgotPassword
} from '../controllers/authController';
import { authenticate, getCurrentUser } from '../middleware/auth';
import { User } from '../models/User';

const router = Router();

// Middleware de validación para registro
const validateSLPRegistration = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('licenseNumber')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('El número de licencia debe tener entre 5 y 20 caracteres'),
  body('specialization')
    .isArray({ min: 1 })
    .withMessage('Debe especificar al menos una especialización'),
  body('specialization.*')
    .isIn(['articulation', 'language', 'fluency', 'voice', 'swallowing', 'cognitive'])
    .withMessage('Especialización inválida'),
  body('yearsOfExperience')
    .isInt({ min: 0, max: 50 })
    .withMessage('Los años de experiencia deben ser entre 0 y 50')
];

const validateChildRegistration = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Fecha de nacimiento inválida'),
  body('parentEmail')
    .isEmail()
    .withMessage('Email del padre inválido')
    .normalizeEmail(),
  body('skillLevel')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Nivel de habilidad inválido'),
  body('primaryGoals')
    .isArray({ min: 1, max: 5 })
    .withMessage('Debe especificar entre 1 y 5 objetivos'),
  body('primaryGoals.*')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Cada objetivo debe tener entre 10 y 200 caracteres')
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];

const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
];

// Rutas de autenticación
// POST /api/auth/register/slp - Registro de SLP
router.post(
  '/register/slp',
  authRateLimiter,
  validateSLPRegistration,
  asyncErrorHandler(registerSLP)
);

// POST /api/auth/register/child - Registro de Child
router.post(
  '/register/child',
  authRateLimiter,
  validateChildRegistration,
  asyncErrorHandler(registerChild)
);

// POST /api/auth/login - Login de usuario
router.post(
  '/login',
  authRateLimiter,
  validateLogin,
  asyncErrorHandler(login)
);

// POST /api/auth/logout - Logout de usuario
router.post(
  '/logout',
  authenticate,
  asyncErrorHandler(logout)
);

// GET /api/auth/verify - Verificar token
router.get(
  '/verify',
  authenticate,
  asyncErrorHandler(verifyAuth)
);

// POST /api/auth/change-password - Cambiar contraseña
router.post(
  '/change-password',
  authenticate,
  validatePasswordChange,
  asyncErrorHandler(changePassword)
);

// POST /api/auth/forgot-password - Solicitar recuperación de contraseña
router.post(
  '/forgot-password',
  authRateLimiter,
  validateForgotPassword,
  asyncErrorHandler(forgotPassword)
);

// GET /api/auth/me - Obtener información del usuario actual
router.get(
  '/me',
  authenticate,
  asyncErrorHandler(getCurrentUser)
);

// Endpoint para verificar usuarios (solo en desarrollo)
if (process.env['NODE_ENV'] === 'development') {
  router.get('/check-users', async (_req, res) => {
    try {
      const users = await User.find({}).select('email firstName lastName role createdAt');
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });
}

export default router;

