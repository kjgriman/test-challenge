import { Request, Response, NextFunction } from 'express';

// Interfaz para errores personalizados
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

// Clase para errores operacionales
export class OperationalError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    
    // Mantener el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Clase para errores de validación
export class ValidationError extends OperationalError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, 400, code);
  }
}

// Clase para errores de autenticación
export class AuthenticationError extends OperationalError {
  constructor(message: string = 'No autorizado', code: string = 'AUTHENTICATION_ERROR') {
    super(message, 401, code);
  }
}

// Clase para errores de autorización
export class AuthorizationError extends OperationalError {
  constructor(message: string = 'Acceso denegado', code: string = 'AUTHORIZATION_ERROR') {
    super(message, 403, code);
  }
}

// Clase para errores de recurso no encontrado
export class NotFoundError extends OperationalError {
  constructor(message: string = 'Recurso no encontrado', code: string = 'NOT_FOUND_ERROR') {
    super(message, 404, code);
  }
}

// Clase para errores de conflicto
export class ConflictError extends OperationalError {
  constructor(message: string, code: string = 'CONFLICT_ERROR') {
    super(message, 409, code);
  }
}

// Clase para errores de límite de tasa
export class RateLimitError extends OperationalError {
  constructor(message: string = 'Demasiadas solicitudes', code: string = 'RATE_LIMIT_ERROR') {
    super(message, 429, code);
  }
}

// Función para crear errores de validación de Mongoose
export const createMongooseValidationError = (error: any): ValidationError => {
  const messages = Object.values(error.errors).map((err: any) => err.message);
  return new ValidationError(messages.join(', '), 'MONGOOSE_VALIDATION_ERROR');
};

// Función para crear errores de duplicación de Mongoose
export const createMongooseDuplicateError = (error: any): ConflictError => {
  const field = Object.keys(error.keyPattern)[0];
  const keyValue = error.keyValue as Record<string, any>;
  const value = keyValue && field && keyValue[field] ? keyValue[field] : 'valor';
  return new ConflictError(`${field} '${value}' ya existe`, 'MONGOOSE_DUPLICATE_ERROR');
};

// Función para crear errores de cast de Mongoose
export const createMongooseCastError = (error: any): ValidationError => {
  return new ValidationError(`ID inválido: ${error.value}`, 'MONGOOSE_CAST_ERROR');
};

// Middleware principal de manejo de errores
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
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
  const statusCode = error.statusCode || 500;
  
  // Determinar si es un error operacional
  const isOperational = error.isOperational || false;
  
  // Determinar el código de error
  const errorCode = error.code || 'INTERNAL_ERROR';
  
  // Crear respuesta de error
  const errorResponse = {
    success: false,
    error: {
      message: isOperational ? error.message : 'Error interno del servidor',
      code: errorCode,
      ...(process.env['NODE_ENV'] === 'development' && {
        stack: error.stack,
        details: error.message
      })
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    // Agregar flag para redirección si es usuario no encontrado
    ...(errorCode === 'USER_NOT_FOUND' && {
      shouldRedirect: true
    })
  };

  // Enviar respuesta
  res.status(statusCode).json(errorResponse);
};

// Middleware para capturar errores no manejados
export const unhandledErrorHandler = (error: Error): void => {
  console.error('💥 Error no manejado:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  // En producción, podrías enviar el error a un servicio de monitoreo
  // como Sentry, LogRocket, etc.
  
  process.exit(1);
};

// Middleware para capturar promesas rechazadas
export const unhandledRejectionHandler = (reason: any, promise: Promise<any>): void => {
  console.error('🚫 Promesa rechazada no manejada:', {
    reason,
    promise,
    timestamp: new Date().toISOString()
  });
  
  // En producción, podrías enviar el error a un servicio de monitoreo
  
  process.exit(1);
};

// Middleware para manejar errores de async/await
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Función para enviar respuestas de error consistentes
export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  code: string = 'CUSTOM_ERROR'
): void => {
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      timestamp: new Date().toISOString()
    }
  });
};

// Función para enviar respuestas de éxito consistentes
export const sendSuccessResponse = (
  res: Response,
  data: any,
  message: string = 'Operación exitosa',
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Configurar handlers globales para errores no capturados
export const setupGlobalErrorHandlers = (): void => {
  process.on('uncaughtException', unhandledErrorHandler);
  process.on('unhandledRejection', unhandledRejectionHandler);
};

