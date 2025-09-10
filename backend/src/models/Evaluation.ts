import mongoose, { Document, Schema } from 'mongoose';

// Enums para tipos de evaluación
export enum EvaluationType {
  INITIAL = 'initial',
  PROGRESS = 'progress',
  FINAL = 'final',
  SPECIFIC = 'specific'
}

export enum EvaluationStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum AssessmentArea {
  ARTICULATION = 'articulation',
  LANGUAGE = 'language',
  FLUENCY = 'fluency',
  VOICE = 'voice',
  SWALLOWING = 'swallowing',
  COGNITIVE = 'cognitive',
  SOCIAL = 'social',
  READING = 'reading',
  WRITING = 'writing'
}

// Interfaz para resultados de evaluación
export interface IEvaluationResult {
  area: AssessmentArea;
  subArea?: string;
  score: number; // 0-100
  maxScore: number;
  percentage: number;
  observations: string;
  recommendations: string[];
}

// Interfaz para el documento de evaluación
export interface IEvaluation extends Document {
  slpId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  evaluationType: EvaluationType;
  status: EvaluationStatus;
  
  // Información básica
  title: string;
  description: string;
  scheduledDate: Date;
  startTime?: Date;
  endTime?: Date;
  duration?: number; // en minutos
  
  // Áreas evaluadas
  assessmentAreas: AssessmentArea[];
  
  // Resultados de evaluación
  results: IEvaluationResult[];
  
  // Métricas generales
  overallScore: number;
  averageScore: number;
  strengths: string[];
  weaknesses: string[];
  
  // Recomendaciones y plan de tratamiento
  recommendations: string[];
  treatmentPlan: {
    goals: string[];
    strategies: string[];
    frequency: string;
    duration: string;
  };
  
  // Notas del SLP
  slpNotes: string;
  behavioralObservations: string[];
  
  // Información adicional
  toolsUsed: string[];
  environment: string;
  parentFeedback?: string;
  
  // Métodos de instancia
  calculateOverallScore(): void;
  getDuration(): number;
  isActive(): boolean;
  addResult(result: IEvaluationResult): void;
  updateResult(area: AssessmentArea, result: Partial<IEvaluationResult>): void;
}

// Esquema de Mongoose
const evaluationSchema = new Schema<IEvaluation>({
  slpId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID del SLP es requerido'],
    index: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID del estudiante es requerido'],
    index: true
  },
  evaluationType: {
    type: String,
    enum: Object.values(EvaluationType),
    required: [true, 'Tipo de evaluación es requerido']
  },
  status: {
    type: String,
    enum: Object.values(EvaluationStatus),
    default: EvaluationStatus.SCHEDULED,
    required: true
  },
  
  // Información básica
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Fecha programada es requerida'],
    validate: {
      validator: function(this: IEvaluation, value: Date) {
        // Para evaluaciones completadas o en progreso, permitir fechas en el pasado
        if (this.status === EvaluationStatus.COMPLETED || this.status === EvaluationStatus.IN_PROGRESS) {
          return true;
        }
        // Para otras evaluaciones, la fecha no puede ser en el pasado
        return value >= new Date();
      },
      message: 'La fecha programada no puede ser en el pasado'
    }
  },
  startTime: {
    type: Date,
    validate: {
      validator: function(this: IEvaluation, value: Date) {
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
      validator: function(this: IEvaluation, value: Date) {
        // endTime debe ser después de startTime
        if (this.startTime && value) {
          return value > this.startTime;
        }
        return true;
      },
      message: 'La hora de fin debe ser después de la hora de inicio'
    }
  },
  duration: {
    type: Number,
    min: [5, 'La duración debe ser al menos 5 minutos'],
    max: [180, 'La duración no puede exceder 3 horas']
  },
  
  // Áreas evaluadas
  assessmentAreas: [{
    type: String,
    enum: Object.values(AssessmentArea),
    required: true
  }],
  
  // Resultados de evaluación
  results: [{
    area: {
      type: String,
      enum: Object.values(AssessmentArea),
      required: true
    },
    subArea: {
      type: String,
      maxlength: [50, 'El subárea no puede exceder 50 caracteres']
    },
    score: {
      type: Number,
      required: true,
      min: [0, 'El puntaje no puede ser negativo'],
      max: [100, 'El puntaje no puede exceder 100']
    },
    maxScore: {
      type: Number,
      required: true,
      min: [1, 'El puntaje máximo debe ser al menos 1']
    },
    percentage: {
      type: Number,
      required: true,
      min: [0, 'El porcentaje no puede ser negativo'],
      max: [100, 'El porcentaje no puede exceder 100']
    },
    observations: {
      type: String,
      maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres']
    },
    recommendations: [{
      type: String,
      maxlength: [200, 'Cada recomendación no puede exceder 200 caracteres']
    }]
  }],
  
  // Métricas generales
  overallScore: {
    type: Number,
    default: 0,
    min: [0, 'El puntaje general no puede ser negativo'],
    max: [100, 'El puntaje general no puede exceder 100']
  },
  averageScore: {
    type: Number,
    default: 0,
    min: [0, 'El puntaje promedio no puede ser negativo'],
    max: [100, 'El puntaje promedio no puede exceder 100']
  },
  strengths: [{
    type: String,
    maxlength: [200, 'Cada fortaleza no puede exceder 200 caracteres']
  }],
  weaknesses: [{
    type: String,
    maxlength: [200, 'Cada debilidad no puede exceder 200 caracteres']
  }],
  
  // Recomendaciones y plan de tratamiento
  recommendations: [{
    type: String,
    maxlength: [300, 'Cada recomendación no puede exceder 300 caracteres']
  }],
  treatmentPlan: {
    goals: [{
      type: String,
      maxlength: [200, 'Cada objetivo no puede exceder 200 caracteres']
    }],
    strategies: [{
      type: String,
      maxlength: [200, 'Cada estrategia no puede exceder 200 caracteres']
    }],
    frequency: {
      type: String,
      maxlength: [50, 'La frecuencia no puede exceder 50 caracteres']
    },
    duration: {
      type: String,
      maxlength: [50, 'La duración no puede exceder 50 caracteres']
    }
  },
  
  // Notas del SLP
  slpNotes: {
    type: String,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres']
  },
  behavioralObservations: [{
    type: String,
    maxlength: [300, 'Cada observación no puede exceder 300 caracteres']
  }],
  
  // Información adicional
  toolsUsed: [{
    type: String,
    maxlength: [100, 'Cada herramienta no puede exceder 100 caracteres']
  }],
  environment: {
    type: String,
    enum: ['clinic', 'home', 'school', 'virtual', 'other'],
    default: 'clinic'
  },
  parentFeedback: {
    type: String,
    maxlength: [500, 'El feedback de los padres no puede exceder 500 caracteres']
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
        
        // Determinar si está activa
        ret.isActive = ret.status === EvaluationStatus.IN_PROGRESS;
      } catch (error) {
        console.log('⚠️ Error en transform del modelo Evaluation:', error);
        // Valores por defecto si hay error
        ret.duration = ret.duration || 0;
        ret.isActive = false;
      }
      return ret;
    }
  }
});

// Índices para optimizar consultas
evaluationSchema.index({ slpId: 1, status: 1 });
evaluationSchema.index({ studentId: 1, status: 1 });
evaluationSchema.index({ scheduledDate: 1 });
evaluationSchema.index({ evaluationType: 1, status: 1 });

// Método para calcular puntaje general
evaluationSchema.methods.calculateOverallScore = function(): void {
  if (this.results && this.results.length > 0) {
    const totalScore = this.results.reduce((sum: number, result: IEvaluationResult) => sum + result.score, 0);
    const totalMaxScore = this.results.reduce((sum: number, result: IEvaluationResult) => sum + result.maxScore, 0);
    
    this.overallScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
    this.averageScore = this.results.length > 0 ? Math.round(totalScore / this.results.length) : 0;
  }
};

// Método para obtener duración
evaluationSchema.methods.getDuration = function(): number {
  if (this.startTime && this.endTime) {
    return Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
  }
  return this.duration || 0;
};

// Método para verificar si está activa
evaluationSchema.methods.isActive = function(): boolean {
  return this.status === EvaluationStatus.IN_PROGRESS;
};

// Método para agregar resultado
evaluationSchema.methods.addResult = function(result: IEvaluationResult): void {
  this.results.push(result);
  this.calculateOverallScore();
};

// Método para actualizar resultado
evaluationSchema.methods.updateResult = function(area: AssessmentArea, result: Partial<IEvaluationResult>): void {
  const existingResult = this.results.find((r: IEvaluationResult) => r.area === area);
  if (existingResult) {
    Object.assign(existingResult, result);
    this.calculateOverallScore();
  }
};

// Middleware pre-save para calcular métricas
evaluationSchema.pre('save', function(this: IEvaluation) {
  this.calculateOverallScore();
});

export const Evaluation = mongoose.model<IEvaluation>('Evaluation', evaluationSchema);
