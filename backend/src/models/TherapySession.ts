import mongoose, { Document, Schema } from 'mongoose';

// Enumeración de estados de sesión
export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Enumeración de tipos de actividad
export enum ActivityType {
  PRONUNCIATION = 'pronunciation',
  LANGUAGE_COMPREHENSION = 'language_comprehension',
  FLUENCY = 'fluency',
  VOCAL_EXERCISES = 'vocal_exercises',
  INTERACTIVE_GAME = 'interactive_game'
}

// Interfaz para resultados de juegos
export interface IGameResult {
  word: string;
  pronunciation: 'correct' | 'incorrect' | 'partial';
  timestamp: Date;
  notes?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeSpent: number; // en segundos
  attempts: number;
}

// Interfaz para métricas de sesión
export interface ISessionMetrics {
  totalActivities: number;
  correctAnswers: number;
  incorrectAnswers: number;
  partialAnswers: number;
  accuracyPercentage: number;
  averageResponseTime: number; // en segundos
  totalSessionTime: number; // en minutos
  engagementScore: number; // 1-10
}

// Interfaz para participantes de video
export interface IVideoParticipant {
  userId: mongoose.Types.ObjectId;
  name: string;
  role: 'slp' | 'child';
  joinedAt: Date;
  isActive: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  connectionId?: string; // ID de conexión WebRTC
}

// Interfaz para el documento de sesión
export interface ITherapySession extends Document {
  slpId: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  status: SessionStatus;
  sessionType: 'therapy' | 'evaluation' | 'game';
  scheduledDate: Date;
  startTime?: Date;
  endTime?: Date;
  
  // Video conferencia
  videoEnabled: boolean;
  videoParticipants: IVideoParticipant[];
  videoRoomId?: string; // ID único de la sala de video
  videoStartedAt?: Date;
  videoEndedAt?: Date;
  
  // Actividades y resultados
  activities: {
    type: ActivityType;
    description: string;
    duration: number; // en minutos
    completed: boolean;
  }[];
  
  gameResults: IGameResult[];
  
  // Métricas calculadas
  metrics: ISessionMetrics;
  
  // Notas y observaciones
  slpNotes: string;
  behavioralObservations: string[];
  
  // Resumen AI (futuro)
  aiSummary?: string;
  
  // Propiedades adicionales para compatibilidad
  duration?: number;
  notes?: string;
  goals?: string[];
  gamesPlayed?: number;
  accuracy?: number;
  totalScore?: number;
  lastGameAccuracy?: number;
  lastGameDate?: Date;
  
  // Métodos de instancia
  calculateMetrics(): void;
  getDuration(): number; // en minutos
  getAccuracy(): number;
  isActive(): boolean;
  startVideo(): Promise<void>;
  endVideo(): Promise<void>;
  addVideoParticipant(userId: mongoose.Types.ObjectId, name: string, role: 'slp' | 'child'): Promise<void>;
  removeVideoParticipant(userId: mongoose.Types.ObjectId): Promise<void>;
  getActiveVideoParticipants(): IVideoParticipant[];
}

// Esquema de Mongoose
const therapySessionSchema = new Schema<ITherapySession>({
  slpId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID del SLP es requerido'],
    index: true
  },
  childId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID del niño es requerido'],
    index: true
  },
  status: {
    type: String,
    enum: Object.values(SessionStatus),
    default: SessionStatus.SCHEDULED,
    required: true
  },
  sessionType: {
    type: String,
    enum: ['therapy', 'evaluation', 'game'],
    default: 'therapy',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Fecha programada es requerida'],
    validate: {
      validator: function(this: ITherapySession, value: Date) {
        // Para sesiones completadas o en progreso, permitir fechas en el pasado
        if (this.status === SessionStatus.COMPLETED || this.status === SessionStatus.IN_PROGRESS) {
          return true;
        }
        // Para otras sesiones, la fecha no puede ser en el pasado
        return value >= new Date();
      },
      message: 'La fecha programada no puede ser en el pasado'
    }
  },
  startTime: {
    type: Date,
    validate: {
      validator: function(this: ITherapySession, value: Date) {
        // startTime debe ser después de scheduledDate
        if (this.scheduledDate && value) {
          return value >= this.scheduledDate;
        }
        return true;
      },
      message: 'La hora de inicio debe ser después de la fecha programada'
    }
  },
  endTime: {
    type: Date,
    validate: {
      validator: function(this: ITherapySession, value: Date) {
        // endTime debe ser después de startTime
        if (this.startTime && value) {
          return value > this.startTime;
        }
        return true;
      },
      message: 'La hora de fin debe ser después de la hora de inicio'
    }
  },
  
  // Video conferencia
  videoEnabled: {
    type: Boolean,
    default: false
  },
  videoParticipants: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['slp', 'child'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    isVideoOff: {
      type: Boolean,
      default: false
    },
    connectionId: {
      type: String
    }
  }],
  videoRoomId: {
    type: String,
    unique: true,
    sparse: true
  },
  videoStartedAt: {
    type: Date
  },
  videoEndedAt: {
    type: Date
  },
  
  // Actividades planificadas
  activities: [{
    type: {
      type: String,
      enum: Object.values(ActivityType),
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    },
    duration: {
      type: Number,
      required: true,
      min: [1, 'La duración debe ser al menos 1 minuto'],
      max: [60, 'La duración no puede exceder 60 minutos']
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  
  // Resultados de juegos
  gameResults: [{
    word: {
      type: String,
      required: true,
      maxlength: [100, 'La palabra no puede exceder 100 caracteres']
    },
    pronunciation: {
      type: String,
      enum: ['correct', 'incorrect', 'partial'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: [200, 'Las notas no pueden exceder 200 caracteres']
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true
    },
    timeSpent: {
      type: Number,
      required: true,
      min: [0, 'El tiempo no puede ser negativo']
    },
    attempts: {
      type: Number,
      required: true,
      min: [1, 'Debe haber al menos 1 intento']
    }
  }],
  
  // Métricas calculadas
  metrics: {
    totalActivities: {
      type: Number,
      default: 0,
      min: [0, 'El total de actividades no puede ser negativo']
    },
    correctAnswers: {
      type: Number,
      default: 0,
      min: [0, 'Las respuestas correctas no pueden ser negativas']
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
      min: [0, 'Las respuestas incorrectas no pueden ser negativas']
    },
    partialAnswers: {
      type: Number,
      default: 0,
      min: [0, 'Las respuestas parciales no pueden ser negativas']
    },
    accuracyPercentage: {
      type: Number,
      default: 0,
      min: [0, 'El porcentaje de precisión no puede ser negativo'],
      max: [100, 'El porcentaje de precisión no puede exceder 100']
    },
    averageResponseTime: {
      type: Number,
      default: 0,
      min: [0, 'El tiempo promedio de respuesta no puede ser negativo']
    },
    totalSessionTime: {
      type: Number,
      default: 0,
      min: [0, 'El tiempo total de sesión no puede ser negativo']
    },
    engagementScore: {
      type: Number,
      default: 5,
      min: [1, 'El puntaje de engagement debe ser al menos 1'],
      max: [10, 'El puntaje de engagement no puede exceder 10']
    }
  },
  
  // Notas del SLP
  slpNotes: {
    type: String,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres']
  },
  
  // Observaciones conductuales
  behavioralObservations: [{
    type: String,
    maxlength: [300, 'Cada observación no puede exceder 300 caracteres']
  }],
  
  // Resumen AI (implementación futura)
  aiSummary: {
    type: String,
    maxlength: [2000, 'El resumen AI no puede exceder 2000 caracteres']
  },
  
  // Propiedades adicionales para compatibilidad
  duration: {
    type: Number,
    min: [1, 'La duración debe ser al menos 1 minuto'],
    max: [180, 'La duración no puede exceder 3 horas']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres']
  },
  goals: [{
    type: String,
    maxlength: [200, 'Cada objetivo no puede exceder 200 caracteres']
  }],
  gamesPlayed: {
    type: Number,
    default: 0,
    min: [0, 'Los juegos jugados no pueden ser negativos']
  },
  accuracy: {
    type: Number,
    min: [0, 'La precisión no puede ser negativa'],
    max: [100, 'La precisión no puede exceder 100%']
  },
  totalScore: {
    type: Number,
    default: 0,
    min: [0, 'El puntaje total no puede ser negativo']
  },
  lastGameAccuracy: {
    type: Number,
    min: [0, 'La precisión del último juego no puede ser negativa'],
    max: [100, 'La precisión del último juego no puede exceder 100%']
  },
  lastGameDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_doc: any, ret: any) {
      // Agregar campos calculados de forma segura
      try {
        // Calcular duración directamente desde los campos
        if (ret.startTime && ret.endTime) {
          ret.duration = Math.round((new Date(ret.endTime).getTime() - new Date(ret.startTime).getTime()) / (1000 * 60));
        } else {
          ret.duration = ret.duration || 0;
        }
        
        // Calcular precisión desde métricas
        if (ret.metrics && ret.metrics.totalActivities > 0) {
          ret.accuracy = Math.round((ret.metrics.correctAnswers / ret.metrics.totalActivities) * 100);
        } else {
          ret.accuracy = ret.accuracy || 0;
        }
        
        // Determinar si está activa
        ret.isActive = ret.status === 'active';
      } catch (error) {
        console.log('⚠️ Error en transform del modelo TherapySession:', error);
        // Valores por defecto si hay error
        ret.duration = ret.duration || 0;
        ret.accuracy = ret.accuracy || 0;
        ret.isActive = false;
      }
      return ret;
    }
  }
});

// Índices para optimizar consultas
therapySessionSchema.index({ slpId: 1, status: 1 });
therapySessionSchema.index({ childId: 1, status: 1 });
therapySessionSchema.index({ scheduledDate: 1 });
therapySessionSchema.index({ status: 1, scheduledDate: 1 });

// Método para calcular métricas
(therapySessionSchema.methods as any).calculateMetrics = function(): void {
  const totalAnswers = (this as any).gameResults.length;
  const correct = (this as any).gameResults.filter((r: any) => r.pronunciation === 'correct').length;
  const incorrect = (this as any).gameResults.filter((r: any) => r.pronunciation === 'incorrect').length;
  const partial = (this as any).gameResults.filter((r: any) => r.pronunciation === 'partial').length;
  
  (this as any).metrics.totalActivities = (this as any).activities.length;
  (this as any).metrics.correctAnswers = correct;
  (this as any).metrics.incorrectAnswers = incorrect;
  (this as any).metrics.partialAnswers = partial;
  (this as any).metrics.accuracyPercentage = totalAnswers > 0 ? Math.round((correct / totalAnswers) * 100) : 0;
  
  // Calcular tiempo promedio de respuesta
  if ((this as any).gameResults.length > 0) {
    const totalTime = (this as any).gameResults.reduce((sum: number, result: any) => sum + result.timeSpent, 0);
    (this as any).metrics.averageResponseTime = Math.round(totalTime / (this as any).gameResults.length);
  }
  
  // Calcular tiempo total de sesión
  if ((this as any).startTime && (this as any).endTime) {
    (this as any).metrics.totalSessionTime = Math.round(((this as any).endTime.getTime() - (this as any).startTime.getTime()) / (1000 * 60));
  }
};

// Método para obtener duración de la sesión
(therapySessionSchema.methods as any).getDuration = function(): number {
  if ((this as any).startTime && (this as any).endTime) {
    return Math.round(((this as any).endTime.getTime() - (this as any).startTime.getTime()) / (1000 * 60));
  }
  return 0;
};

// Método para obtener precisión
(therapySessionSchema.methods as any).getAccuracy = function(): number {
  return (this as any).metrics.accuracyPercentage;
};

// Método para verificar si la sesión está activa
(therapySessionSchema.methods as any).isActive = function(): boolean {
  return (this as any).status === SessionStatus.IN_PROGRESS;
};

// Métodos de video conferencia
(therapySessionSchema.methods as any).startVideo = async function(): Promise<void> {
  (this as any).videoEnabled = true;
  (this as any).videoStartedAt = new Date();
  (this as any).videoRoomId = `session_${(this as any)._id}_${Date.now()}`;
  await (this as any).save();
};

(therapySessionSchema.methods as any).endVideo = async function(): Promise<void> {
  (this as any).videoEnabled = false;
  (this as any).videoEndedAt = new Date();
  // Marcar todos los participantes como inactivos
  (this as any).videoParticipants.forEach((participant: any) => {
    participant.isActive = false;
  });
  await (this as any).save();
};

(therapySessionSchema.methods as any).addVideoParticipant = async function(
  userId: mongoose.Types.ObjectId, 
  name: string, 
  role: 'slp' | 'child'
): Promise<void> {
  const existingParticipant = (this as any).videoParticipants.find(
    (p: any) => p.userId.toString() === userId.toString()
  );
  
  if (existingParticipant) {
    // Actualizar participante existente
    existingParticipant.isActive = true;
    existingParticipant.joinedAt = new Date();
  } else {
    // Agregar nuevo participante
    (this as any).videoParticipants.push({
      userId,
      name,
      role,
      joinedAt: new Date(),
      isActive: true,
      isMuted: false,
      isVideoOff: false
    });
  }
  
  await (this as any).save();
};

(therapySessionSchema.methods as any).removeVideoParticipant = async function(
  userId: mongoose.Types.ObjectId
): Promise<void> {
  const participant = (this as any).videoParticipants.find(
    (p: any) => p.userId.toString() === userId.toString()
  );
  if (participant) {
    participant.isActive = false;
    await (this as any).save();
  }
};

(therapySessionSchema.methods as any).getActiveVideoParticipants = function(): any[] {
  return (this as any).videoParticipants.filter((p: any) => p.isActive);
};

// Middleware pre-save para calcular métricas
therapySessionSchema.pre('save', function(next) {
  if (this.gameResults.length > 0) {
    this.calculateMetrics();
  }
  next();
});

// Middleware pre-save para validar estado
therapySessionSchema.pre('save', function(next) {
  // Si la sesión se marca como completada, debe tener endTime
  if (this.status === SessionStatus.COMPLETED && !this.endTime) {
    this.endTime = new Date();
  }
  
  // Si se establece startTime, cambiar estado a IN_PROGRESS
  if (this.startTime && this.status === SessionStatus.SCHEDULED) {
    this.status = SessionStatus.IN_PROGRESS;
  }
  
  next();
});

export const TherapySession = mongoose.model<ITherapySession>('TherapySession', therapySessionSchema);

