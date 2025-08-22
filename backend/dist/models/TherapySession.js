"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TherapySession = exports.ActivityType = exports.SessionStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Enumeración de estados de sesión
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["SCHEDULED"] = "scheduled";
    SessionStatus["IN_PROGRESS"] = "in_progress";
    SessionStatus["COMPLETED"] = "completed";
    SessionStatus["CANCELLED"] = "cancelled";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
// Enumeración de tipos de actividad
var ActivityType;
(function (ActivityType) {
    ActivityType["PRONUNCIATION"] = "pronunciation";
    ActivityType["LANGUAGE_COMPREHENSION"] = "language_comprehension";
    ActivityType["FLUENCY"] = "fluency";
    ActivityType["VOCAL_EXERCISES"] = "vocal_exercises";
    ActivityType["INTERACTIVE_GAME"] = "interactive_game";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
// Esquema de Mongoose
const therapySessionSchema = new mongoose_1.Schema({
    slpId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'ID del SLP es requerido'],
        index: true
    },
    childId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    scheduledDate: {
        type: Date,
        required: [true, 'Fecha programada es requerida'],
        validate: {
            validator: function (value) {
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
            validator: function (value) {
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
            validator: function (value) {
                // endTime debe ser después de startTime
                if (this.startTime && value) {
                    return value > this.startTime;
                }
                return true;
            },
            message: 'La hora de fin debe ser después de la hora de inicio'
        }
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
        transform: function (_doc, ret) {
            // Agregar campos calculados
            ret.duration = this.getDuration();
            ret.accuracy = this.getAccuracy();
            ret.isActive = this.isActive();
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
therapySessionSchema.methods.calculateMetrics = function () {
    const totalAnswers = this.gameResults.length;
    const correct = this.gameResults.filter((r) => r.pronunciation === 'correct').length;
    const incorrect = this.gameResults.filter((r) => r.pronunciation === 'incorrect').length;
    const partial = this.gameResults.filter((r) => r.pronunciation === 'partial').length;
    this.metrics.totalActivities = this.activities.length;
    this.metrics.correctAnswers = correct;
    this.metrics.incorrectAnswers = incorrect;
    this.metrics.partialAnswers = partial;
    this.metrics.accuracyPercentage = totalAnswers > 0 ? Math.round((correct / totalAnswers) * 100) : 0;
    // Calcular tiempo promedio de respuesta
    if (this.gameResults.length > 0) {
        const totalTime = this.gameResults.reduce((sum, result) => sum + result.timeSpent, 0);
        this.metrics.averageResponseTime = Math.round(totalTime / this.gameResults.length);
    }
    // Calcular tiempo total de sesión
    if (this.startTime && this.endTime) {
        this.metrics.totalSessionTime = Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
    }
};
// Método para obtener duración de la sesión
therapySessionSchema.methods.getDuration = function () {
    if (this.startTime && this.endTime) {
        return Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
    }
    return 0;
};
// Método para obtener precisión
therapySessionSchema.methods.getAccuracy = function () {
    return this.metrics.accuracyPercentage;
};
// Método para verificar si la sesión está activa
therapySessionSchema.methods.isActive = function () {
    return this.status === SessionStatus.IN_PROGRESS;
};
// Middleware pre-save para calcular métricas
therapySessionSchema.pre('save', function (next) {
    if (this.gameResults.length > 0) {
        this.calculateMetrics();
    }
    next();
});
// Middleware pre-save para validar estado
therapySessionSchema.pre('save', function (next) {
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
exports.TherapySession = mongoose_1.default.model('TherapySession', therapySessionSchema);
//# sourceMappingURL=TherapySession.js.map