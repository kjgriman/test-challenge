import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Configuración de rate limiting para diferentes endpoints
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env['NODE_ENV'] === 'development' ? 1000 : 100, // Más permisivo en desarrollo
  message: {
    success: false,
    error: {
      message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true, // Incluir headers estándar de rate limit
  legacyHeaders: false, // No incluir headers legacy
  handler: (req: Request, res: Response) => {
    // Log del rate limit excedido para monitoreo
    console.warn('⚠️ Rate limit excedido:', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos',
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString()
      }
    });
  },
  // Función para generar la clave del rate limit
  keyGenerator: (req: Request) => {
    // Usar IP del usuario como clave principal
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Función para saltar ciertas rutas del rate limiting
  skip: (req: Request) => {
    // Saltar health checks y endpoints de monitoreo
    return req.path === '/health' || req.path === '/metrics';
  }
});

// Rate limiter más estricto para autenticación
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env['NODE_ENV'] === 'development' ? 50 : 5, // Más permisivo en desarrollo
  message: {
    success: false,
    error: {
      message: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn('🔒 Rate limit de autenticación excedido:', {
      ip: req.ip,
      url: req.url,
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString()
      }
    });
  },
  keyGenerator: (req: Request) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Aplicar solo a rutas de autenticación
  skip: (req: Request) => {
    return !req.path.includes('/auth');
  }
});

// Rate limiter para WebSocket connections
export const wsRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // Máximo 10 conexiones WebSocket por minuto
  message: {
    success: false,
    error: {
      message: 'Demasiadas conexiones WebSocket, intenta de nuevo en 1 minuto',
      code: 'WS_RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn('📡 Rate limit de WebSocket excedido:', {
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiadas conexiones WebSocket, intenta de nuevo en 1 minuto',
        code: 'WS_RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString()
      }
    });
  },
  keyGenerator: (req: Request) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

// Rate limiter para creación de sesiones
export const sessionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Máximo 10 sesiones creadas por hora
  message: {
    success: false,
    error: {
      message: 'Demasiadas sesiones creadas, intenta de nuevo en 1 hora',
      code: 'SESSION_RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn('📅 Rate limit de sesiones excedido:', {
      ip: req.ip,
      userId: req.user?.id || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiadas sesiones creadas, intenta de nuevo en 1 hora',
        code: 'SESSION_RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString()
      }
    });
  },
  keyGenerator: (req: Request) => {
    // Usar ID del usuario si está autenticado, sino IP
    return req.user?.id || req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Aplicar solo a rutas de sesiones
  skip: (req: Request) => {
    return !req.path.includes('/sessions');
  }
});

// Rate limiter para juegos
export const gameRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60, // Máximo 60 acciones de juego por minuto
  message: {
    success: false,
    error: {
      message: 'Demasiadas acciones de juego, intenta de nuevo en 1 minuto',
      code: 'GAME_RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn('🎮 Rate limit de juegos excedido:', {
      ip: req.ip,
      userId: req.user?.id || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiadas acciones de juego, intenta de nuevo en 1 minuto',
        code: 'GAME_RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString()
      }
    });
  },
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Aplicar solo a rutas de juegos
  skip: (req: Request) => {
    return !req.path.includes('/games');
  }
});

// Middleware para aplicar rate limiting dinámico basado en el rol del usuario
export const dynamicRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  // Aplicar rate limiting más estricto para usuarios no autenticados
  if (!req.user) {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 50
    })(req, res, next);
  }
  
  // Aplicar rate limiting basado en el rol
  const userRole = req.user.role;
  
  if (userRole === 'slp') {
    // SLP tienen límites más altos
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200
    })(req, res, next);
  } else if (userRole === 'child') {
    // Niños tienen límites más bajos para prevenir abuso
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100
    })(req, res, next);
  }
  
  // Rate limiting por defecto
  next();
};

// Función para obtener información del rate limit
export const getRateLimitInfo = (req: Request) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userId = req.user?.id || 'anonymous';
  
  return {
    ip,
    userId,
    userRole: req.user?.role || 'anonymous',
    timestamp: new Date().toISOString()
  };
};

// Función para loggear intentos de rate limit
export const logRateLimitAttempt = (req: Request, endpoint: string) => {
  const info = getRateLimitInfo(req);
  
  console.log('📊 Rate limit attempt:', {
    ...info,
    endpoint,
    userAgent: req.get('User-Agent')
  });
};

