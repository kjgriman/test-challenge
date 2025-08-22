"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = exports.changePassword = exports.logout = exports.verifyAuth = exports.login = exports.registerChild = exports.registerSLP = void 0;
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const errorHandler_2 = require("../middleware/errorHandler");
// Función para validar datos de registro
const validateRegistrationData = (data, role) => {
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
        throw new errorHandler_2.ValidationError('Todos los campos básicos son requeridos');
    }
    if (data.password.length < 6) {
        throw new errorHandler_2.ValidationError('La contraseña debe tener al menos 6 caracteres');
    }
    if (role === User_1.UserRole.SLP) {
        if (!data.licenseNumber || !data.specialization || !data.yearsOfExperience) {
            throw new errorHandler_2.ValidationError('Todos los campos de SLP son requeridos');
        }
        if (data.yearsOfExperience < 0) {
            throw new errorHandler_2.ValidationError('Los años de experiencia no pueden ser negativos');
        }
    }
    if (role === User_1.UserRole.CHILD) {
        if (!data.parentEmail || !data.skillLevel || !data.primaryGoals) {
            throw new errorHandler_2.ValidationError('Todos los campos de Child son requeridos');
        }
        if (data.primaryGoals.length === 0) {
            throw new errorHandler_2.ValidationError('Debe especificar al menos un objetivo');
        }
    }
};
// Controlador para registro de SLP
const registerSLP = async (req, res, next) => {
    try {
        const registrationData = req.body;
        // Validar datos de entrada
        validateRegistrationData(registrationData, User_1.UserRole.SLP);
        // Verificar si el email ya existe
        const existingUser = await User_1.User.findOne({ email: registrationData.email });
        if (existingUser) {
            throw new errorHandler_2.ConflictError('El email ya está registrado');
        }
        // Verificar si el número de licencia ya existe
        const existingLicense = await User_1.User.findOne({ 'slp.licenseNumber': registrationData.licenseNumber });
        if (existingLicense) {
            throw new errorHandler_2.ConflictError('El número de licencia ya está registrado');
        }
        // Crear nuevo usuario SLP
        const newSLP = new User_1.User({
            ...registrationData,
            role: User_1.UserRole.SLP,
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
        const token = (0, auth_1.generateToken)(savedSLP);
        // Log de registro exitoso
        console.log('✅ Nuevo SLP registrado:', {
            userId: savedSLP._id,
            email: savedSLP.email,
            licenseNumber: savedSLP.slp?.licenseNumber,
            timestamp: new Date().toISOString()
        });
        // Enviar respuesta exitosa
        (0, errorHandler_1.sendSuccessResponse)(res, {
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
    }
    catch (error) {
        next(error);
    }
};
exports.registerSLP = registerSLP;
// Controlador para registro de Child
const registerChild = async (req, res, next) => {
    try {
        const registrationData = req.body;
        // Validar datos de entrada
        validateRegistrationData(registrationData, User_1.UserRole.CHILD);
        // Verificar si el email ya existe
        const existingUser = await User_1.User.findOne({ email: registrationData.email });
        if (existingUser) {
            throw new errorHandler_2.ConflictError('El email ya está registrado');
        }
        // Verificar si el email del padre ya existe (opcional)
        if (registrationData.parentEmail !== registrationData.email) {
            const existingParent = await User_1.User.findOne({ email: registrationData.parentEmail });
            if (!existingParent) {
                console.warn('⚠️ Email de padre no encontrado en el sistema:', registrationData.parentEmail);
            }
        }
        // Crear nuevo usuario Child
        const newChild = new User_1.User({
            ...registrationData,
            role: User_1.UserRole.CHILD,
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
        const token = (0, auth_1.generateToken)(savedChild);
        // Log de registro exitoso
        console.log('✅ Nuevo Child registrado:', {
            userId: savedChild._id,
            email: savedChild.email,
            parentEmail: savedChild.child?.parentEmail,
            skillLevel: savedChild.child?.skillLevel,
            timestamp: new Date().toISOString()
        });
        // Enviar respuesta exitosa
        (0, errorHandler_1.sendSuccessResponse)(res, {
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
    }
    catch (error) {
        next(error);
    }
};
exports.registerChild = registerChild;
// Controlador para login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Validar datos de entrada
        if (!email || !password) {
            throw new errorHandler_2.ValidationError('Email y contraseña son requeridos');
        }
        // Buscar usuario por email
        const user = await User_1.User.findOne({ email });
        if (!user) {
            throw new errorHandler_2.AuthenticationError('Credenciales inválidas');
        }
        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new errorHandler_2.AuthenticationError('Credenciales inválidas');
        }
        // Generar token JWT
        const token = (0, auth_1.generateToken)(user);
        // Log de login exitoso
        console.log('🔐 Usuario logueado:', {
            userId: user._id,
            email: user.email,
            role: user.role,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        // Enviar respuesta exitosa
        (0, errorHandler_1.sendSuccessResponse)(res, {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profilePicture: user.profilePicture,
                ...(user.role === User_1.UserRole.SLP && {
                    slp: {
                        licenseNumber: user.slp?.licenseNumber,
                        specialization: user.slp?.specialization,
                        yearsOfExperience: user.slp?.yearsOfExperience,
                        caseloadCount: user.slp?.caseload?.length || 0
                    }
                }),
                ...(user.role === User_1.UserRole.CHILD && {
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
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
// Controlador para verificar token
const verifyAuth = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_2.AuthenticationError('Usuario no autenticado');
        }
        // Enviar respuesta exitosa con información del usuario
        (0, errorHandler_1.sendSuccessResponse)(res, {
            user: {
                id: req.user._id,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                role: req.user.role,
                profilePicture: req.user.profilePicture,
                ...(req.user.role === User_1.UserRole.SLP && {
                    slp: {
                        licenseNumber: req.user.slp?.licenseNumber,
                        specialization: req.user.slp?.specialization,
                        yearsOfExperience: req.user.slp?.yearsOfExperience,
                        caseloadCount: req.user.slp?.caseload?.length || 0
                    }
                }),
                ...(req.user.role === User_1.UserRole.CHILD && {
                    child: {
                        skillLevel: req.user.child?.skillLevel,
                        primaryGoals: req.user.child?.primaryGoals,
                        sessionsCompleted: req.user.child?.sessionsCompleted,
                        totalSessionTime: req.user.child?.totalSessionTime
                    }
                })
            }
        }, 'Token válido');
    }
    catch (error) {
        next(error);
    }
};
exports.verifyAuth = verifyAuth;
// Controlador para logout
const logout = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_2.AuthenticationError('Usuario no autenticado');
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
        (0, errorHandler_1.sendSuccessResponse)(res, null, 'Logout exitoso');
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
// Controlador para cambiar contraseña
const changePassword = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_2.AuthenticationError('Usuario no autenticado');
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            throw new errorHandler_2.ValidationError('Contraseña actual y nueva son requeridas');
        }
        if (newPassword.length < 6) {
            throw new errorHandler_2.ValidationError('La nueva contraseña debe tener al menos 6 caracteres');
        }
        // Verificar contraseña actual
        const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new errorHandler_2.AuthenticationError('Contraseña actual incorrecta');
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
        (0, errorHandler_1.sendSuccessResponse)(res, null, 'Contraseña cambiada exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
// Controlador para recuperar contraseña (futuro)
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new errorHandler_2.ValidationError('Email es requerido');
        }
        // Buscar usuario
        const user = await User_1.User.findOne({ email });
        if (!user) {
            // Por seguridad, no revelar si el email existe o no
            (0, errorHandler_1.sendSuccessResponse)(res, null, 'Si el email existe, se enviará un enlace de recuperación');
            return;
        }
        // TODO: Implementar envío de email con token de recuperación
        console.log('📧 Solicitud de recuperación de contraseña:', {
            email,
            userId: user._id,
            timestamp: new Date().toISOString()
        });
        // Enviar respuesta exitosa
        (0, errorHandler_1.sendSuccessResponse)(res, null, 'Si el email existe, se enviará un enlace de recuperación');
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
//# sourceMappingURL=authController.js.map