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
exports.Game = exports.GameDifficulty = exports.GameType = exports.GameStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Enumeración de estados del juego
var GameStatus;
(function (GameStatus) {
    GameStatus["WAITING"] = "waiting";
    GameStatus["ACTIVE"] = "active";
    GameStatus["PAUSED"] = "paused";
    GameStatus["COMPLETED"] = "completed";
    GameStatus["CANCELLED"] = "cancelled";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
// Enumeración de tipos de juego
var GameType;
(function (GameType) {
    GameType["PRONUNCIATION_PRACTICE"] = "pronunciation_practice";
    GameType["WORD_RECOGNITION"] = "word_recognition";
    GameType["SOUND_MATCHING"] = "sound_matching";
    GameType["LANGUAGE_COMPREHENSION"] = "language_comprehension";
})(GameType || (exports.GameType = GameType = {}));
// Enumeración de dificultades
var GameDifficulty;
(function (GameDifficulty) {
    GameDifficulty["EASY"] = "easy";
    GameDifficulty["MEDIUM"] = "medium";
    GameDifficulty["HARD"] = "hard";
})(GameDifficulty || (exports.GameDifficulty = GameDifficulty = {}));
// Esquema de Mongoose
const gameSchema = new mongoose_1.Schema({
    sessionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TherapySession',
        required: [true, 'ID de sesión es requerido'],
        index: true
    },
    gameType: {
        type: String,
        enum: Object.values(GameType),
        required: [true, 'Tipo de juego es requerido']
    },
    difficulty: {
        type: String,
        enum: Object.values(GameDifficulty),
        required: [true, 'Dificultad es requerida']
    },
    status: {
        type: String,
        enum: Object.values(GameStatus),
        default: GameStatus.WAITING
    },
    // Jugadores
    slpId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'ID del SLP es requerido']
    },
    childId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'ID del niño es requerido']
    },
    // Estado del juego
    gameState: {
        currentWord: {
            type: String,
            required: true,
            maxlength: [100, 'La palabra no puede exceder 100 caracteres']
        },
        currentPlayer: {
            type: String,
            enum: ['slp', 'child'],
            required: true
        },
        turnNumber: {
            type: Number,
            default: 1,
            min: [1, 'El número de turno debe ser al menos 1']
        },
        maxTurns: {
            type: Number,
            default: 10,
            min: [1, 'El máximo de turnos debe ser al menos 1'],
            max: [50, 'El máximo de turnos no puede exceder 50']
        },
        score: {
            slp: {
                type: Number,
                default: 0,
                min: [0, 'El puntaje no puede ser negativo']
            },
            child: {
                type: Number,
                default: 0,
                min: [0, 'El puntaje no puede ser negativo']
            }
        },
        currentRound: {
            type: Number,
            default: 1,
            min: [1, 'El número de ronda debe ser al menos 1']
        },
        totalRounds: {
            type: Number,
            default: 3,
            min: [1, 'El total de rondas debe ser al menos 1'],
            max: [10, 'El total de rondas no puede exceder 10']
        },
        timeRemaining: {
            type: Number,
            default: 30,
            min: [0, 'El tiempo restante no puede ser negativo']
        },
        isPaused: {
            type: Boolean,
            default: false
        }
    },
    // Historial de acciones
    actions: [{
            playerId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            playerType: {
                type: String,
                enum: ['slp', 'child'],
                required: true
            },
            action: {
                type: String,
                enum: ['word_pronounced', 'evaluation_given', 'turn_skipped', 'game_paused'],
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            data: {
                word: {
                    type: String,
                    maxlength: [100, 'La palabra no puede exceder 100 caracteres']
                },
                pronunciation: {
                    type: String,
                    enum: ['correct', 'incorrect', 'partial']
                },
                notes: {
                    type: String,
                    maxlength: [200, 'Las notas no pueden exceder 200 caracteres']
                },
                timeSpent: {
                    type: Number,
                    min: [0, 'El tiempo no puede ser negativo']
                }
            }
        }],
    // Configuración del juego
    settings: {
        timePerTurn: {
            type: Number,
            default: 30,
            min: [10, 'El tiempo por turno debe ser al menos 10 segundos'],
            max: [120, 'El tiempo por turno no puede exceder 120 segundos']
        },
        maxAttemptsPerWord: {
            type: Number,
            default: 3,
            min: [1, 'El máximo de intentos debe ser al menos 1'],
            max: [5, 'El máximo de intentos no puede exceder 5']
        },
        enableHints: {
            type: Boolean,
            default: true
        },
        enableSoundEffects: {
            type: Boolean,
            default: true
        },
        autoAdvance: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            // Agregar campos calculados
            ret.currentPlayer = doc.getCurrentPlayer();
            ret.gameProgress = doc.getGameProgress();
            ret.isGameOver = doc.isGameOver();
            ret.winner = doc.getWinner();
            return ret;
        }
    }
});
// Índices para optimizar consultas
gameSchema.index({ sessionId: 1, status: 1 });
gameSchema.index({ slpId: 1, status: 1 });
gameSchema.index({ childId: 1, status: 1 });
gameSchema.index({ status: 1, createdAt: 1 });
// Método para iniciar el juego
gameSchema.methods.startGame = function () {
    this.status = GameStatus.ACTIVE;
    this.gameState.isPaused = false;
    this.gameState.timeRemaining = this.settings.timePerTurn;
    this.gameState.currentPlayer = 'child'; // El niño siempre empieza
    // Agregar acción de inicio
    this.actions.push({
        playerId: this.slpId,
        playerType: 'slp',
        action: 'game_paused',
        timestamp: new Date(),
        data: {}
    });
};
// Método para pausar el juego
gameSchema.methods.pauseGame = function () {
    this.gameState.isPaused = true;
    this.status = GameStatus.PAUSED;
    this.actions.push({
        playerId: this.slpId,
        playerType: 'slp',
        action: 'game_paused',
        timestamp: new Date(),
        data: {}
    });
};
// Método para reanudar el juego
gameSchema.methods.resumeGame = function () {
    this.gameState.isPaused = false;
    this.status = GameStatus.ACTIVE;
};
// Método para terminar el juego
gameSchema.methods.endGame = function () {
    this.status = GameStatus.COMPLETED;
    this.gameState.timeRemaining = 0;
};
// Método para avanzar al siguiente turno
gameSchema.methods.nextTurn = function () {
    if (this.gameState.turnNumber >= this.gameState.maxTurns) {
        this.endGame();
        return;
    }
    this.gameState.turnNumber++;
    this.gameState.currentPlayer = this.gameState.currentPlayer === 'slp' ? 'child' : 'slp';
    this.gameState.timeRemaining = this.settings.timePerTurn;
    // Cambiar de ronda si es necesario
    if (this.gameState.turnNumber > this.gameState.maxTurns / this.gameState.totalRounds) {
        this.gameState.currentRound++;
    }
};
// Método para evaluar pronunciación
gameSchema.methods.evaluatePronunciation = function (word, pronunciation, notes) {
    // Agregar acción de evaluación
    this.actions.push({
        playerId: this.slpId,
        playerType: 'slp',
        action: 'evaluation_given',
        timestamp: new Date(),
        data: {
            word,
            pronunciation,
            notes
        }
    });
    // Actualizar puntaje
    if (pronunciation === 'correct') {
        this.gameState.score.child += 10;
    }
    else if (pronunciation === 'partial') {
        this.gameState.score.child += 5;
    }
    // Avanzar al siguiente turno
    this.nextTurn();
};
// Método para obtener el jugador actual
gameSchema.methods.getCurrentPlayer = function () {
    return this.gameState.currentPlayer;
};
// Método para obtener el progreso del juego
gameSchema.methods.getGameProgress = function () {
    return Math.round((this.gameState.turnNumber / this.gameState.maxTurns) * 100);
};
// Método para verificar si el juego ha terminado
gameSchema.methods.isGameOver = function () {
    return this.status === GameStatus.COMPLETED ||
        this.gameState.turnNumber >= this.gameState.maxTurns;
};
// Método para obtener el ganador
gameSchema.methods.getWinner = function () {
    if (!this.isGameOver())
        return null;
    if (this.gameState.score.slp > this.gameState.score.child) {
        return 'slp';
    }
    else if (this.gameState.score.child > this.gameState.score.slp) {
        return 'child';
    }
    else {
        return 'tie';
    }
};
// Middleware pre-save para validaciones
gameSchema.pre('save', function (next) {
    // Validar que el juego no exceda el máximo de turnos
    if (this.gameState.turnNumber > this.gameState.maxTurns) {
        this.invalidate('gameState.turnNumber', 'El turno no puede exceder el máximo');
    }
    // Validar que el tiempo restante no sea negativo
    if (this.gameState.timeRemaining < 0) {
        this.gameState.timeRemaining = 0;
    }
    next();
});
exports.Game = mongoose_1.default.model('Game', gameSchema);
//# sourceMappingURL=Game.js.map