import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { 
  forgotPassword, 
  verifyResetToken, 
  resetPassword, 
  changePassword 
} from '../controllers/passwordController';
import { authenticate } from '../middleware/auth';

// Middleware para validar requests
const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Datos de entrada inválidos',
        details: errors.array()
      }
    });
  }
  next();
};

const router = Router();

// Validaciones
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .toLowerCase()
];

const verifyTokenValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token es requerido')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token es requerido'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

// Rutas públicas
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);
router.post('/verify-reset-token', verifyTokenValidation, validateRequest, verifyResetToken);
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);

// Rutas protegidas
router.post('/change-password', authenticate, changePasswordValidation, validateRequest, changePassword);

export default router;
