import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Enumeración de roles de usuario
export enum UserRole {
  SLP = 'slp',      // Speech Language Pathologist
  CHILD = 'child'   // Niño en terapia
}

// Enumeración de niveles de habilidad
export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

// Interfaz para el documento de usuario
export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  profilePicture?: string;
  
  // Campos específicos para SLP
  slp?: {
    licenseNumber: string;
    specialization: string[];
    yearsOfExperience: number;
    caseload: mongoose.Types.ObjectId[]; // IDs de estudiantes
  };
  
  // Campos específicos para Child
  child?: {
    parentEmail: string;
    skillLevel: SkillLevel;
    primaryGoals: string[];
    currentSLP?: mongoose.Types.ObjectId;
    sessionsCompleted: number;
    totalSessionTime: number; // en minutos
  };
  
  // Métodos de instancia
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
  getDisplayName(): string;
}

// Esquema de Mongoose
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: [true, 'El rol es requerido']
  },
  firstName: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true,
    maxlength: [50, 'El apellido no puede exceder 50 caracteres']
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        // Validar que la fecha no sea en el futuro
        return value <= new Date();
      },
      message: 'La fecha de nacimiento no puede ser en el futuro'
    }
  },
  profilePicture: {
    type: String,
    default: null
  },
  
  // Campos específicos para SLP
  slp: {
    licenseNumber: {
      type: String,
      required: function(this: IUser) { return this.role === UserRole.SLP; },
      unique: true,
      sparse: true
    },
    specialization: [{
      type: String,
      enum: ['articulation', 'language', 'fluency', 'voice', 'swallowing', 'cognitive']
    }],
    yearsOfExperience: {
      type: Number,
      min: [0, 'Los años de experiencia no pueden ser negativos'],
      required: function(this: IUser) { return this.role === UserRole.SLP; }
    },
    caseload: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    caseloadCount: {
      type: Number,
      default: 0,
      min: [0, 'El contador de estudiantes no puede ser negativo']
    }
  },
  
  // Campos específicos para Child
  child: {
    parentEmail: {
      type: String,
      required: function(this: IUser) { return this.role === UserRole.CHILD; },
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email de padre inválido']
    },
    skillLevel: {
      type: String,
      enum: Object.values(SkillLevel),
      default: SkillLevel.BEGINNER,
      required: function(this: IUser) { return this.role === UserRole.CHILD; }
    },
    primaryGoals: [{
      type: String,
      maxlength: [200, 'Cada objetivo no puede exceder 200 caracteres']
    }],
    currentSLP: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    sessionsCompleted: {
      type: Number,
      default: 0,
      min: [0, 'Las sesiones completadas no pueden ser negativas']
    },
    totalSessionTime: {
      type: Number,
      default: 0,
      min: [0, 'El tiempo total de sesión no puede ser negativo']
    },
    notes: {
      type: String,
      maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres']
    }
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  toJSON: {
    transform: function(_doc: any, ret: any) {
      // Remover password del JSON de respuesta
      if (ret.password) {
        delete ret.password;
      }
      return ret;
    }
  }
});

// Índices para optimizar consultas
userSchema.index({ role: 1 });
userSchema.index({ 'child.currentSLP': 1 });

// Middleware pre-save para hashear password
userSchema.pre('save', async function(next) {
  // Solo hashear si el password ha sido modificado y no está ya hasheado
  if (!this.isModified('password')) return next();
  
  // Verificar si ya está hasheado (empieza con $2a$)
  if (this.password.startsWith('$2a$')) {
    return next();
  }
  
  try {
    // Hash del password con salt de 12 rounds
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Método para comparar passwords
(userSchema.methods as any).comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, (this as any).password);
  } catch (error) {
    throw new Error('Error comparando contraseñas');
  }
};

// Método para obtener nombre completo
(userSchema.methods as any).getFullName = function(): string {
  return `${(this as any).firstName} ${(this as any).lastName}`;
};

// Método para obtener nombre de display
(userSchema.methods as any).getDisplayName = function(): string {
  if ((this as any).role === UserRole.SLP) {
    return `Dr. ${(this as any).lastName}`;
  }
  return (this as any).firstName;
};

// Validación personalizada para campos condicionales
userSchema.pre('validate', function(next) {
  if (this.role === UserRole.SLP && !this.slp) {
    this.invalidate('slp', 'Los campos de SLP son requeridos para este rol');
  }
  
  if (this.role === UserRole.CHILD && !this.child) {
    this.invalidate('child', 'Los campos de Child son requeridos para este rol');
  }
  
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);

