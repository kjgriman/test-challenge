import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { AuthenticationError, AuthorizationError } from './errorHandler';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

// Interfaz para el payload del JWT
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Configuración del JWT
const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';
const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '24h';

// Función para generar token JWT
export const generateToken = (user: any): string => {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

// Función para verificar token JWT
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new AuthenticationError('Token inválido o expirado');
  }
};

// Middleware principal de autenticación
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Token de autenticación requerido');
    }
    
    const token = authHeader.substring(7); // Remover 'Bearer ' del inicio
    req.token = token;
    
    // Verificar y decodificar el token
    const decoded = verifyToken(token);
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      // Usuario no encontrado - probablemente de base de datos local
      const error = new AuthenticationError('Usuario no encontrado - Sesión expirada');
      (error as any).code = 'USER_NOT_FOUND';
      (error as any).shouldRedirect = true;
      throw error;
    }
    
    // Verificar que el rol del token coincida con el rol del usuario
    if (decoded.role !== user.role) {
      throw new AuthenticationError('Token inválido: rol no coincide');
    }
    
    // Agregar usuario a la request
    req.user = user;
    
    // Log de autenticación exitosa
    console.log('🔐 Usuario autenticado:', {
      userId: user._id,
      email: user.email,
      role: user.role,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para verificar rol específico
export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('Usuario no autenticado');
    }
    
    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      throw new AuthorizationError(
        `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`
      );
    }
    
    next();
  };
};

// Middleware para verificar que el usuario sea SLP
export const requireSLP = requireRole(UserRole.SLP);

// Middleware para verificar que el usuario sea Child
export const requireChild = requireRole(UserRole.CHILD);

// Middleware para verificar que el usuario sea SLP o Child
export const requireSLPOrChild = requireRole([UserRole.SLP, UserRole.CHILD]);

// Middleware para verificar propiedad del recurso
export const requireOwnership = (resourceField: string = 'userId') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('Usuario no autenticado');
    }
    
    const resourceId = req.params[resourceField] || req.body[resourceField];
    
    if (!resourceId) {
      throw new AuthorizationError('ID del recurso requerido');
    }
    
    // SLP pueden acceder a recursos de sus estudiantes
    if (req.user.role === UserRole.SLP) {
      const hasAccess = req.user.slp?.caseload?.includes(resourceId);
      
      if (!hasAccess && req.user._id.toString() !== resourceId) {
        throw new AuthorizationError('Acceso denegado al recurso');
      }
    } else {
      // Child solo puede acceder a sus propios recursos
      if (req.user._id.toString() !== resourceId) {
        throw new AuthorizationError('Acceso denegado al recurso');
      }
    }
    
    next();
  };
};

// Middleware para verificar acceso a sesión
export const requireSessionAccess = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Usuario no autenticado');
    }
    
    const sessionId = req.params['sessionId'] || req.body['sessionId'];
    
    if (!sessionId) {
      throw new AuthorizationError('ID de sesión requerido');
    }
    
    // Importar el modelo de sesión aquí para evitar dependencias circulares
    const { TherapySession } = await import('../models/TherapySession');
    
    const session = await TherapySession.findById(sessionId);
    
    if (!session) {
      throw new AuthorizationError('Sesión no encontrada');
    }
    
    // Verificar acceso basado en el rol
    if (req.user.role === UserRole.SLP) {
      if (session.slpId.toString() !== req.user._id.toString()) {
        throw new AuthorizationError('Acceso denegado a la sesión');
      }
    } else if (req.user.role === UserRole.CHILD) {
      if (session.childId.toString() !== req.user._id.toString()) {
        throw new AuthorizationError('Acceso denegado a la sesión');
      }
    }
    
    // Agregar la sesión a la request para uso posterior
    (req as any).session = session;
    
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para verificar acceso a juego (temporalmente deshabilitado)
// export const requireGameAccess = async (
//   req: Request,
//   _res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     if (!req.user) {
//       throw new AuthenticationError('Usuario no autenticado');
//     }
//     
//     const gameId = req.params['gameId'] || req.body['gameId'];
//     
//     if (!gameId) {
//       throw new AuthorizationError('ID de juego requerido');
//     }
//     
//     // Importar el modelo de juego aquí para evitar dependencias circulares
//     // const { Game } = await import('../models/Game');
//     
//     const game = await Game.findById(gameId);
//     
//     if (!game) {
//       throw new AuthorizationError('Juego no encontrado');
//     }
//     
//     // Verificar acceso basado en el rol
//     if (req.user.role === UserRole.SLP) {
//       if (game.slpId.toString() !== req.user._id.toString()) {
//         throw new AuthorizationError('Acceso denegado al juego');
//       }
//     } else if (req.user.role === UserRole.CHILD) {
//       if (game.childId.toString() !== req.user._id.toString()) {
//         throw new AuthorizationError('Acceso denegado al juego');
//       }
//     }
//     
//     // Agregar el juego a la request para uso posterior
//     (req as any).game = game;
//     
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// Middleware opcional de autenticación (no falla si no hay token)
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continuar sin usuario autenticado
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && decoded.role === user.role) {
      req.user = user;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // Si hay error en el token, continuar sin usuario autenticado
    next();
  }
};

// Middleware para verificar si el usuario es SLP
export const isSLP = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'slp') {
    next();
  } else {
    throw new AuthenticationError('Acceso denegado - Solo para SLP');
  }
};

// Función para refrescar token
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Usuario no autenticado');
    }
    
    // Generar nuevo token
    const newToken = generateToken(req.user);
    
    res.json({
      success: true,
      message: 'Token refrescado exitosamente',
      data: {
        token: newToken,
        user: {
          id: req.user._id,
          email: req.user.email,
          role: req.user.role,
          firstName: req.user.firstName,
          lastName: req.user.lastName
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Función para invalidar token (logout)
export const invalidateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.token) {
      throw new AuthenticationError('No hay token para invalidar');
    }
    
    // En una implementación más robusta, podrías agregar el token a una blacklist
    // Por ahora, solo respondemos que se invalidó exitosamente
    
    console.log('🔓 Usuario deslogueado:', {
      userId: req.user?._id,
      email: req.user?.email,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Función para obtener información del usuario autenticado
export const getCurrentUser = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Usuario no autenticado');
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          role: req.user.role,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          profilePicture: req.user.profilePicture,
          ...(req.user.role === UserRole.SLP && {
            slp: {
              licenseNumber: req.user.slp.licenseNumber,
              specialization: req.user.slp.specialization,
              yearsOfExperience: req.user.slp.yearsOfExperience
            }
          }),
          ...(req.user.role === UserRole.CHILD && {
            child: {
              skillLevel: req.user.child.skillLevel,
              primaryGoals: req.user.child.primaryGoals,
              sessionsCompleted: req.user.child.sessionsCompleted
            }
          })
        }
      }
    });
  } catch (error) {
    _next(error);
  }
};

