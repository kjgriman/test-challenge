"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TherapySession = exports.ActivityType = exports.SessionStatus = void 0;
var mongoose_1 = require("mongoose");
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
var therapySessionSchema = new mongoose_1.Schema({
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
    // Video conferencia
    videoEnabled: {
        type: Boolean,
        default: false
    },
    videoParticipants: [{
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
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
        transform: function (_doc, ret) {
            // Agregar campos calculados de forma segura
            try {
                // Calcular duración directamente desde los campos
                if (ret.startTime && ret.endTime) {
                    ret.duration = Math.round((new Date(ret.endTime).getTime() - new Date(ret.startTime).getTime()) / (1000 * 60));
                }
                else {
                    ret.duration = ret.duration || 0;
                }
                // Calcular precisión desde métricas
                if (ret.metrics && ret.metrics.totalActivities > 0) {
                    ret.accuracy = Math.round((ret.metrics.correctAnswers / ret.metrics.totalActivities) * 100);
                }
                else {
                    ret.accuracy = ret.accuracy || 0;
                }
                // Determinar si está activa
                ret.isActive = ret.status === 'active';
            }
            catch (error) {
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
therapySessionSchema.methods.calculateMetrics = function () {
    var totalAnswers = this.gameResults.length;
    var correct = this.gameResults.filter(function (r) { return r.pronunciation === 'correct'; }).length;
    var incorrect = this.gameResults.filter(function (r) { return r.pronunciation === 'incorrect'; }).length;
    var partial = this.gameResults.filter(function (r) { return r.pronunciation === 'partial'; }).length;
    this.metrics.totalActivities = this.activities.length;
    this.metrics.correctAnswers = correct;
    this.metrics.incorrectAnswers = incorrect;
    this.metrics.partialAnswers = partial;
    this.metrics.accuracyPercentage = totalAnswers > 0 ? Math.round((correct / totalAnswers) * 100) : 0;
    // Calcular tiempo promedio de respuesta
    if (this.gameResults.length > 0) {
        var totalTime = this.gameResults.reduce(function (sum, result) { return sum + result.timeSpent; }, 0);
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
// Métodos de video conferencia
therapySessionSchema.methods.startVideo = function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    this.videoEnabled = true;
                    this.videoStartedAt = new Date();
                    this.videoRoomId = "session_".concat(this._id, "_").concat(Date.now());
                    return [4 /*yield*/, this.save()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
therapySessionSchema.methods.endVideo = function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    this.videoEnabled = false;
                    this.videoEndedAt = new Date();
                    // Marcar todos los participantes como inactivos
                    this.videoParticipants.forEach(function (participant) {
                        participant.isActive = false;
                    });
                    return [4 /*yield*/, this.save()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
therapySessionSchema.methods.addVideoParticipant = function (userId, name, role) {
    return __awaiter(this, void 0, void 0, function () {
        var existingParticipant;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    existingParticipant = this.videoParticipants.find(function (p) { return p.userId.toString() === userId.toString(); });
                    if (existingParticipant) {
                        // Actualizar participante existente
                        existingParticipant.isActive = true;
                        existingParticipant.joinedAt = new Date();
                    }
                    else {
                        // Agregar nuevo participante
                        this.videoParticipants.push({
                            userId: userId,
                            name: name,
                            role: role,
                            joinedAt: new Date(),
                            isActive: true,
                            isMuted: false,
                            isVideoOff: false
                        });
                    }
                    return [4 /*yield*/, this.save()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
therapySessionSchema.methods.removeVideoParticipant = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
        var participant;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    participant = this.videoParticipants.find(function (p) { return p.userId.toString() === userId.toString(); });
                    if (!participant) return [3 /*break*/, 2];
                    participant.isActive = false;
                    return [4 /*yield*/, this.save()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
};
therapySessionSchema.methods.getActiveVideoParticipants = function () {
    return this.videoParticipants.filter(function (p) { return p.isActive; });
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
