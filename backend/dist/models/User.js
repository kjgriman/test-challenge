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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.SkillLevel = exports.UserRole = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Enumeración de roles de usuario
var UserRole;
(function (UserRole) {
    UserRole["SLP"] = "slp";
    UserRole["CHILD"] = "child"; // Niño en terapia
})(UserRole || (exports.UserRole = UserRole = {}));
// Enumeración de niveles de habilidad
var SkillLevel;
(function (SkillLevel) {
    SkillLevel["BEGINNER"] = "beginner";
    SkillLevel["INTERMEDIATE"] = "intermediate";
    SkillLevel["ADVANCED"] = "advanced";
})(SkillLevel || (exports.SkillLevel = SkillLevel = {}));
// Esquema de Mongoose
const userSchema = new mongoose_1.Schema({
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
            validator: function (value) {
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
            required: function () { return this.role === UserRole.SLP; },
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
            required: function () { return this.role === UserRole.SLP; }
        },
        caseload: [{
                type: mongoose_1.Schema.Types.ObjectId,
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
            required: function () { return this.role === UserRole.CHILD; },
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email de padre inválido']
        },
        skillLevel: {
            type: String,
            enum: Object.values(SkillLevel),
            default: SkillLevel.BEGINNER,
            required: function () { return this.role === UserRole.CHILD; }
        },
        primaryGoals: [{
                type: String,
                maxlength: [200, 'Cada objetivo no puede exceder 200 caracteres']
            }],
        currentSLP: {
            type: mongoose_1.Schema.Types.ObjectId,
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
        transform: function (_doc, ret) {
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
userSchema.pre('save', async function (next) {
    // Solo hashear si el password ha sido modificado y no está ya hasheado
    if (!this.isModified('password'))
        return next();
    // Verificar si ya está hasheado (empieza con $2a$)
    if (this.password.startsWith('$2a$')) {
        return next();
    }
    try {
        // Hash del password con salt de 12 rounds
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Método para comparar passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcryptjs_1.default.compare(candidatePassword, this.password);
    }
    catch (error) {
        throw new Error('Error comparando contraseñas');
    }
};
// Método para obtener nombre completo
userSchema.methods.getFullName = function () {
    return `${this.firstName} ${this.lastName}`;
};
// Método para obtener nombre de display
userSchema.methods.getDisplayName = function () {
    if (this.role === UserRole.SLP) {
        return `Dr. ${this.lastName}`;
    }
    return this.firstName;
};
// Validación personalizada para campos condicionales
userSchema.pre('validate', function (next) {
    if (this.role === UserRole.SLP && !this.slp) {
        this.invalidate('slp', 'Los campos de SLP son requeridos para este rol');
    }
    if (this.role === UserRole.CHILD && !this.child) {
        this.invalidate('child', 'Los campos de Child son requeridos para este rol');
    }
    next();
});
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map