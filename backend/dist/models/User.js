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
exports.User = exports.SkillLevel = exports.UserRole = void 0;
var mongoose_1 = require("mongoose");
var bcrypt = require("bcryptjs");
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
var userSchema = new mongoose_1.Schema({
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
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Solo hashear si el password ha sido modificado y no está ya hasheado
                    if (!this.isModified('password'))
                        return [2 /*return*/, next()];
                    // Verificar si ya está hasheado (empieza con $2a$)
                    if (this.password.startsWith('$2a$')) {
                        return [2 /*return*/, next()];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, bcrypt.genSalt(12)];
                case 2:
                    salt = _b.sent();
                    _a = this;
                    return [4 /*yield*/, bcrypt.hash(this.password, salt)];
                case 3:
                    _a.password = _b.sent();
                    next();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    next(error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
});
// Método para comparar passwords
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, bcrypt.compare(candidatePassword, this.password)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_2 = _a.sent();
                    throw new Error('Error comparando contraseñas');
                case 3: return [2 /*return*/];
            }
        });
    });
};
// Método para obtener nombre completo
userSchema.methods.getFullName = function () {
    return "".concat(this.firstName, " ").concat(this.lastName);
};
// Método para obtener nombre de display
userSchema.methods.getDisplayName = function () {
    if (this.role === UserRole.SLP) {
        return "Dr. ".concat(this.lastName);
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
