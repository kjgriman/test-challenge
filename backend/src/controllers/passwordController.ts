import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { User } from '../models/User';
import PasswordResetToken from '../models/PasswordResetToken';
import { sendSuccessResponse } from '../middleware/errorHandler';
import { ValidationError, NotFoundError, AuthenticationError } from '../middleware/errorHandler';

// Interfaz para el request de solicitud de recuperación
interface ForgotPasswordRequest {
  email: string;
}

// Interfaz para el request de reset de contraseña
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Solicitar recuperación de contraseña
export const forgotPassword = async (
  req: Request<{}, {}, ForgotPasswordRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    // Validar email
    if (!email) {
      throw new ValidationError('El email es requerido');
    }

    // Verificar que el usuario existe
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      res.status(200).json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación'
      });
      return;
    }

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Crear registro de token de recuperación
    const passwordResetToken = new PasswordResetToken({
      email: email.toLowerCase(),
      token: resetToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
    });

    await passwordResetToken.save();

    // En un entorno de producción, aquí enviarías un email
    // Por ahora, solo logueamos el token para desarrollo
    console.log(`🔐 Token de recuperación para ${email}: ${resetToken}`);
    console.log(`🔗 Enlace de recuperación: http://localhost:5173/reset-password?token=${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación',
      // Solo en desarrollo, remover en producción
      ...(process.env.NODE_ENV === 'development' && {
        resetToken,
        resetLink: `http://localhost:5173/reset-password?token=${resetToken}`
      })
    });

  } catch (error) {
    next(error);
  }
};

// Verificar token de recuperación
export const verifyResetToken = async (
  req: Request<{}, {}, { token: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError('El token es requerido');
    }

    // Buscar el token
    const resetToken = await PasswordResetToken.findOne({ token });
    
    if (!resetToken || resetToken.used || resetToken.expiresAt <= new Date()) {
      throw new AuthenticationError('Token inválido o expirado');
    }

    res.status(200).json({
      success: true,
      message: 'Token válido',
      email: resetToken.email
    });

  } catch (error) {
    next(error);
  }
};

// Resetear contraseña
export const resetPassword = async (
  req: Request<{}, {}, ResetPasswordRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // Validar datos
    if (!token || !newPassword || !confirmPassword) {
      throw new ValidationError('Token, nueva contraseña y confirmación son requeridos');
    }

    if (newPassword !== confirmPassword) {
      throw new ValidationError('Las contraseñas no coinciden');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
    }

    // Buscar el token
    const resetToken = await PasswordResetToken.findOne({ token });
    
    if (!resetToken || resetToken.used || resetToken.expiresAt <= new Date()) {
      throw new AuthenticationError('Token inválido o expirado');
    }

    // Buscar el usuario
    const user = await User.findOne({ email: resetToken.email });
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    // Marcar token como usado
    resetToken.used = true;
    await resetToken.save();

    // Invalidar todos los tokens JWT existentes del usuario
    // (En un sistema más complejo, podrías mantener una lista de tokens invalidados)

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

// Cambiar contraseña (para usuarios autenticados)
export const changePassword = async (
  req: Request<{}, {}, { currentPassword: string; newPassword: string; confirmPassword: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      throw new AuthenticationError('Usuario no autenticado');
    }

    // Validar datos
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ValidationError('Contraseña actual, nueva contraseña y confirmación son requeridas');
    }

    if (newPassword !== confirmPassword) {
      throw new ValidationError('Las contraseñas no coinciden');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
    }

    // Buscar el usuario
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Contraseña actual incorrecta');
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};
