import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { User, UserRole, SkillLevel } from '../models/User';
import { generateToken } from '../middleware/auth';
import { sendSuccessResponse } from '../middleware/errorHandler';
import { ValidationError, ConflictError, AuthenticationError } from '../middleware/errorHandler';

// Interfaz para el registro de SLP
interface SLPRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  specialization: string[];
  yearsOfExperience: number;
}

// Interfaz para el registro de Child
interface ChildRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  parentEmail: string;
  skillLevel: SkillLevel;
  primaryGoals: string[];
}

// Función para validar datos de registro
const validateRegistrationData = (data: any, role: UserRole): void => {
  if (!data.email || !data.password || !data.firstName || !data.lastName) {
    throw new ValidationError('Todos los campos básicos son requeridos');
  }
  
  if (data.password.length < 6) {
    throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
  }
  
  if (role === UserRole.SLP) {
    if (!data.licenseNumber || !data.specialization || !data.yearsOfExperience) {
      throw new ValidationError('Todos los campos de SLP son requeridos');
    }
    
    if (data.yearsOfExperience < 0) {
      throw new ValidationError('Los años de experiencia no pueden ser negativos');
    }
  }
  
  if (role === UserRole.CHILD) {
    if (!data.parentEmail || !data.skillLevel || !data.primaryGoals) {
      throw new ValidationError('Todos los campos de Child son requeridos');
    }
    
    if (data.primaryGoals.length === 0) {
      throw new ValidationError('Debe especificar al menos un objetivo');
    }
  }
};

// Controlador para registro de SLP
export const registerSLP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const registrationData: SLPRegistrationData = req.body;
    
    // Validar datos de entrada
    validateRegistrationData(registrationData, UserRole.SLP);
    
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: registrationData.email });
    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }
    
    // Verificar si el número de licencia ya existe
    const existingLicense = await User.findOne({ 'slp.licenseNumber': registrationData.licenseNumber });
    if (existingLicense) {
      throw new ConflictError('El número de licencia ya está registrado');
    }
    
    // Crear nuevo usuario SLP
    const newSLP = new User({
      ...registrationData,
      role: UserRole.SLP,
      slp: {
        licenseNumber: registrationData.licenseNumber,
        specialization: registrationData.specialization,
        yearsOfExperience: registrationData.yearsOfExperience,
        caseload: []
      }
    });
    
    // Guardar usuario en la base de datos
    const savedSLP = await newSLP.save();
    
    // Generar token JWT
    const token = generateToken(savedSLP);
    
    // Log de registro exitoso
    console.log('✅ Nuevo SLP registrado:', {
      userId: savedSLP._id,
      email: savedSLP.email,
      licenseNumber: savedSLP.slp?.licenseNumber,
      timestamp: new Date().toISOString()
    });
    
    // Enviar respuesta exitosa
    sendSuccessResponse(res, {
      user: {
        id: savedSLP._id,
        email: savedSLP.email,
        firstName: savedSLP.firstName,
        lastName: savedSLP.lastName,
        role: savedSLP.role,
        slp: {
          licenseNumber: savedSLP.slp?.licenseNumber,
          specialization: savedSLP.slp?.specialization,
          yearsOfExperience: savedSLP.slp?.yearsOfExperience
        }
      },
      token
    }, 'SLP registrado exitosamente', 201);
    
  } catch (error) {
    next(error);
  }
};

// Controlador para registro de Child
export const registerChild = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const registrationData: ChildRegistrationData = req.body;
    
    // Validar datos de entrada
    validateRegistrationData(registrationData, UserRole.CHILD);
    
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: registrationData.email });
    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }
    
    // Verificar si el email del padre ya existe (opcional)
    if (registrationData.parentEmail !== registrationData.email) {
      const existingParent = await User.findOne({ email: registrationData.parentEmail });
      if (!existingParent) {
        console.warn('⚠️ Email de padre no encontrado en el sistema:', registrationData.parentEmail);
      }
    }
    
    // Crear nuevo usuario Child
    const newChild = new User({
      ...registrationData,
      role: UserRole.CHILD,
      child: {
        parentEmail: registrationData.parentEmail,
        skillLevel: registrationData.skillLevel,
        primaryGoals: registrationData.primaryGoals,
        sessionsCompleted: 0,
        totalSessionTime: 0
      }
    });
    
    // Guardar usuario en la base de datos
    const savedChild = await newChild.save();
    
    // Generar token JWT
    const token = generateToken(savedChild);
    
    // Log de registro exitoso
    console.log('✅ Nuevo Child registrado:', {
      userId: savedChild._id,
      email: savedChild.email,
      parentEmail: savedChild.child?.parentEmail,
      skillLevel: savedChild.child?.skillLevel,
      timestamp: new Date().toISOString()
    });
    
    // Enviar respuesta exitosa
    sendSuccessResponse(res, {
      user: {
        id: savedChild._id,
        email: savedChild.email,
        firstName: savedChild.firstName,
        lastName: savedChild.lastName,
        role: savedChild.role,
        child: {
          skillLevel: savedChild.child?.skillLevel,
          primaryGoals: savedChild.child?.primaryGoals,
          sessionsCompleted: savedChild.child?.sessionsCompleted
        }
      },
      token
    }, 'Child registrado exitosamente', 201);
    
  } catch (error) {
    next(error);
  }
};

// Controlador para login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Validar datos de entrada
    if (!email || !password) {
      throw new ValidationError('Email y contraseña son requeridos');
    }
    
    // Modo mock para desarrollo sin MongoDB
    if (process.env['NODE_ENV'] === 'development' && process.env['USE_IN_MEMORY_DB'] === 'true') {
      console.log('🔧 Modo mock: Login simulado');
      
      // Usuario mock para desarrollo
      const mockUser = {
        _id: 'mock-user-id',
        email: 'kjgriman@gmail.com',
        password: '$2b$12$mock.hash.for.development',
        firstName: 'Kerbin',
        lastName: 'Griman',
        role: 'slp',
        profilePicture: null,
        slp: {
          licenseNumber: '123456780',
          specialization: ['language'],
          yearsOfExperience: 9,
          caseloadCount: 0
        }
      };
      
      // Simular verificación de contraseña
      if (email === 'kjgriman@gmail.com' && password === 'test123') {
        const token = jwt.sign(
          { 
            userId: mockUser._id, 
            email: mockUser.email, 
            role: mockUser.role 
          },
          process.env['JWT_SECRET'] || 'fallback-secret',
          { expiresIn: process.env['JWT_EXPIRES_IN'] || '24h' } as jwt.SignOptions
        );
        
        res.status(200).json({
          success: true,
          message: 'Login exitoso',
          data: {
            user: {
              _id: mockUser._id,
              email: mockUser.email,
              firstName: mockUser.firstName,
              lastName: mockUser.lastName,
              role: mockUser.role,
              profilePicture: mockUser.profilePicture,
              slp: mockUser.slp
            },
            token
          }
        });
        return;
      } else {
        throw new AuthenticationError('Credenciales inválidas');
      }
    }
    
    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthenticationError('Credenciales inválidas');
    }
    
    
    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Credenciales inválidas');
    }
    
    // Generar token JWT
    const token = generateToken(user);
    
    // Log de login exitoso
    console.log('🔐 Usuario logueado:', {
      userId: user._id,
      email: user.email,
      role: user.role,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    // Enviar respuesta exitosa
    sendSuccessResponse(res, {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicture: user.profilePicture,
        ...(user.role === UserRole.SLP && {
          slp: {
            licenseNumber: user.slp?.licenseNumber,
            specialization: user.slp?.specialization,
            yearsOfExperience: user.slp?.yearsOfExperience,
            caseloadCount: user.slp?.caseload?.length || 0
          }
        }),
        ...(user.role === UserRole.CHILD && {
          child: {
            skillLevel: user.child?.skillLevel,
            primaryGoals: user.child?.primaryGoals,
            sessionsCompleted: user.child?.sessionsCompleted,
            totalSessionTime: user.child?.totalSessionTime
          }
        })
      },
      token
    }, 'Login exitoso');
    
  } catch (error) {
    next(error);
  }
};

// Controlador para verificar token
export const verifyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Usuario no autenticado');
    }
    
    // Enviar respuesta exitosa con información del usuario
    sendSuccessResponse(res, {
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        profilePicture: req.user.profilePicture,
        ...(req.user.role === UserRole.SLP && {
          slp: {
            licenseNumber: req.user.slp?.licenseNumber,
            specialization: req.user.slp?.specialization,
            yearsOfExperience: req.user.slp?.yearsOfExperience,
            caseloadCount: req.user.slp?.caseload?.length || 0
          }
        }),
        ...(req.user.role === UserRole.CHILD && {
          child: {
            skillLevel: req.user.child?.skillLevel,
            primaryGoals: req.user.child?.primaryGoals,
            sessionsCompleted: req.user.child?.sessionsCompleted,
            totalSessionTime: req.user.child?.totalSessionTime
          }
        })
      }
    }, 'Token válido');
    
  } catch (error) {
    next(error);
  }
};

// Controlador para logout
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Usuario no autenticado');
    }
    
    // Log de logout
    console.log('🔓 Usuario deslogueado:', {
      userId: req.user._id,
      email: req.user.email,
      role: req.user.role,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    // Enviar respuesta exitosa
    sendSuccessResponse(res, null, 'Logout exitoso');
    
  } catch (error) {
    next(error);
  }
};

// Controlador para cambiar contraseña
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Usuario no autenticado');
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Contraseña actual y nueva son requeridas');
    }
    
    if (newPassword.length < 6) {
      throw new ValidationError('La nueva contraseña debe tener al menos 6 caracteres');
    }
    
    // Verificar contraseña actual
    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Contraseña actual incorrecta');
    }
    
    // Actualizar contraseña
    req.user.password = newPassword;
    await req.user.save();
    
    // Log de cambio de contraseña
    console.log('🔑 Contraseña cambiada:', {
      userId: req.user._id,
      email: req.user.email,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    // Enviar respuesta exitosa
    sendSuccessResponse(res, null, 'Contraseña cambiada exitosamente');
    
  } catch (error) {
    next(error);
  }
};

// Controlador para recuperar contraseña (futuro)
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new ValidationError('Email es requerido');
    }
    
    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      sendSuccessResponse(res, null, 'Si el email existe, se enviará un enlace de recuperación');
      return;
    }
    
    // TODO: Implementar envío de email con token de recuperación
    console.log('📧 Solicitud de recuperación de contraseña:', {
      email,
      userId: user._id,
      timestamp: new Date().toISOString()
    });
    
    // Enviar respuesta exitosa
    sendSuccessResponse(res, null, 'Si el email existe, se enviará un enlace de recuperación');
    
  } catch (error) {
    next(error);
  }
};

