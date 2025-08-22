"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeStudentFromSLP = exports.assignStudentToSLP = exports.getStudentProgress = exports.deleteStudent = exports.updateStudent = exports.createStudent = exports.getStudentById = exports.getStudents = void 0;
const User_1 = require("../models/User");
const TherapySession_1 = require("../models/TherapySession");
const responseUtils_1 = require("../utils/responseUtils");
const errors_1 = require("../utils/errors");
// Obtener todos los estudiantes del SLP
const getStudents = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const slpId = req.user._id;
        const { page = 1, limit = 10, skillLevel, search } = req.query;
        let query = {
            role: 'child',
            'child.currentSLP': slpId
        };
        // Filtrar por nivel de habilidad
        if (skillLevel) {
            query['child.skillLevel'] = skillLevel;
        }
        // Búsqueda por nombre o email
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const students = await User_1.User.find(query)
            .select('firstName lastName email child.skillLevel child.sessionsCompleted child.totalSessionTime child.primaryGoals')
            .sort({ firstName: 1, lastName: 1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await User_1.User.countDocuments(query);
        (0, responseUtils_1.sendSuccessResponse)(res, {
            students,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }, 'Estudiantes obtenidos exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.getStudents = getStudents;
// Obtener estudiante por ID
const getStudentById = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const studentId = req.params['id'];
        const slpId = req.user._id;
        const student = await User_1.User.findById(studentId);
        if (!student || student.role !== 'child') {
            throw new errors_1.NotFoundError('Estudiante no encontrado');
        }
        // Verificar que el estudiante pertenece al SLP
        if (student.child?.currentSLP?.toString() !== slpId.toString()) {
            throw new errors_1.ValidationError('No tienes permisos para ver este estudiante');
        }
        (0, responseUtils_1.sendSuccessResponse)(res, student, 'Estudiante obtenido exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.getStudentById = getStudentById;
// Crear nuevo estudiante
const createStudent = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const slpId = req.user._id;
        const studentData = req.body;
        // Verificar que el email no esté en uso
        const existingUser = await User_1.User.findOne({ email: studentData.email });
        if (existingUser) {
            throw new errors_1.ConflictError('El email ya está registrado');
        }
        // Crear el estudiante
        const student = new User_1.User({
            email: studentData.email,
            password: studentData.password, // Se hasheará automáticamente
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            role: 'child',
            child: {
                parentEmail: studentData.parentEmail,
                skillLevel: studentData.skillLevel,
                primaryGoals: studentData.primaryGoals,
                sessionsCompleted: 0,
                totalSessionTime: 0,
                currentSLP: slpId,
                notes: studentData.notes
            }
        });
        await student.save();
        // Actualizar el contador de estudiantes del SLP
        await User_1.User.findByIdAndUpdate(slpId, {
            $inc: { 'slp.caseloadCount': 1 }
        });
        (0, responseUtils_1.sendSuccessResponse)(res, student, 'Estudiante creado exitosamente', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createStudent = createStudent;
// Actualizar estudiante
const updateStudent = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const studentId = req.params['id'];
        const slpId = req.user._id;
        const updateData = req.body;
        const student = await User_1.User.findById(studentId);
        if (!student || student.role !== 'child') {
            throw new errors_1.NotFoundError('Estudiante no encontrado');
        }
        // Verificar que el estudiante pertenece al SLP
        if (student.child?.currentSLP?.toString() !== slpId.toString()) {
            throw new errors_1.ValidationError('No tienes permisos para modificar este estudiante');
        }
        // Actualizar campos básicos
        if (updateData.firstName)
            student.firstName = updateData.firstName;
        if (updateData.lastName)
            student.lastName = updateData.lastName;
        // Actualizar campos del child
        if (updateData.parentEmail)
            student.child.parentEmail = updateData.parentEmail;
        if (updateData.skillLevel)
            student.child.skillLevel = updateData.skillLevel;
        if (updateData.primaryGoals)
            student.child.primaryGoals = updateData.primaryGoals;
        if (updateData.notes)
            student.child.notes = updateData.notes;
        await student.save();
        (0, responseUtils_1.sendSuccessResponse)(res, student, 'Estudiante actualizado exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.updateStudent = updateStudent;
// Eliminar estudiante
const deleteStudent = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const studentId = req.params['id'];
        const slpId = req.user._id;
        const student = await User_1.User.findById(studentId);
        if (!student || student.role !== 'child') {
            throw new errors_1.NotFoundError('Estudiante no encontrado');
        }
        // Verificar que el estudiante pertenece al SLP
        if (student.child?.currentSLP?.toString() !== slpId.toString()) {
            throw new errors_1.ValidationError('No tienes permisos para eliminar este estudiante');
        }
        // Verificar que no tenga sesiones activas
        const activeSessions = await TherapySession_1.TherapySession.countDocuments({
            childId: studentId,
            status: { $in: ['scheduled', 'in_progress'] }
        });
        if (activeSessions > 0) {
            throw new errors_1.ValidationError('No se puede eliminar un estudiante con sesiones activas');
        }
        // Eliminar el estudiante
        await User_1.User.findByIdAndDelete(studentId);
        // Actualizar el contador de estudiantes del SLP
        await User_1.User.findByIdAndUpdate(slpId, {
            $inc: { 'slp.caseloadCount': -1 }
        });
        (0, responseUtils_1.sendSuccessResponse)(res, null, 'Estudiante eliminado exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteStudent = deleteStudent;
// Obtener progreso del estudiante
const getStudentProgress = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const studentId = req.params['id'];
        const slpId = req.user._id;
        const { period = '30' } = req.query; // días
        const student = await User_1.User.findById(studentId);
        if (!student || student.role !== 'child') {
            throw new errors_1.NotFoundError('Estudiante no encontrado');
        }
        // Verificar que el estudiante pertenece al SLP
        if (student.child?.currentSLP?.toString() !== slpId.toString()) {
            throw new errors_1.ValidationError('No tienes permisos para ver este estudiante');
        }
        // Calcular fecha límite
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(period));
        // Obtener sesiones completadas en el período
        const sessions = await TherapySession_1.TherapySession.find({
            childId: studentId,
            status: 'completed',
            endTime: { $gte: startDate }
        }).sort({ endTime: -1 });
        // Calcular estadísticas
        const totalSessions = sessions.length;
        const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
        const averageAccuracy = sessions.length > 0
            ? sessions.reduce((sum, session) => sum + (session.accuracy || 0), 0) / sessions.length
            : 0;
        const totalGames = sessions.reduce((sum, session) => sum + (session.gamesPlayed || 0), 0);
        // Progreso por objetivo
        const goalsProgress = student.child?.primaryGoals?.map(goal => ({
            goal,
            sessionsCount: sessions.filter(s => s.goals?.includes(goal)).length,
            averageAccuracy: sessions.filter(s => s.goals?.includes(goal))
                .reduce((sum, s) => sum + (s.accuracy || 0), 0) /
                Math.max(sessions.filter(s => s.goals?.includes(goal)).length, 1)
        })) || [];
        const progress = {
            student: {
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                skillLevel: student.child?.skillLevel,
                primaryGoals: student.child?.primaryGoals
            },
            period: Number(period),
            stats: {
                totalSessions,
                totalTime,
                averageAccuracy: Math.round(averageAccuracy * 100) / 100,
                totalGames
            },
            goalsProgress,
            recentSessions: sessions.slice(0, 5) // Últimas 5 sesiones
        };
        (0, responseUtils_1.sendSuccessResponse)(res, progress, 'Progreso del estudiante obtenido exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.getStudentProgress = getStudentProgress;
// Asignar estudiante a SLP
const assignStudentToSLP = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const studentId = req.params['id'];
        const slpId = req.user._id;
        const student = await User_1.User.findById(studentId);
        if (!student || student.role !== 'child') {
            throw new errors_1.NotFoundError('Estudiante no encontrado');
        }
        // Verificar que el estudiante no esté ya asignado a este SLP
        if (student.child?.currentSLP?.toString() === slpId.toString()) {
            throw new errors_1.ConflictError('El estudiante ya está asignado a este SLP');
        }
        // Actualizar asignación
        student.child.currentSLP = slpId;
        await student.save();
        // Actualizar contadores de SLP
        if (student.child?.currentSLP) {
            // Decrementar contador del SLP anterior
            await User_1.User.findByIdAndUpdate(student.child.currentSLP, {
                $inc: { 'slp.caseloadCount': -1 }
            });
        }
        // Incrementar contador del nuevo SLP
        await User_1.User.findByIdAndUpdate(slpId, {
            $inc: { 'slp.caseloadCount': 1 }
        });
        (0, responseUtils_1.sendSuccessResponse)(res, student, 'Estudiante asignado exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.assignStudentToSLP = assignStudentToSLP;
// Remover estudiante del SLP
const removeStudentFromSLP = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const studentId = req.params['id'];
        const slpId = req.user._id;
        const student = await User_1.User.findById(studentId);
        if (!student || student.role !== 'child') {
            throw new errors_1.NotFoundError('Estudiante no encontrado');
        }
        // Verificar que el estudiante esté asignado a este SLP
        if (student.child?.currentSLP?.toString() !== slpId.toString()) {
            throw new errors_1.ValidationError('El estudiante no está asignado a este SLP');
        }
        // Verificar que no tenga sesiones activas
        const activeSessions = await TherapySession_1.TherapySession.countDocuments({
            childId: studentId,
            status: { $in: ['scheduled', 'in_progress'] }
        });
        if (activeSessions > 0) {
            throw new errors_1.ValidationError('No se puede remover un estudiante con sesiones activas');
        }
        // Remover asignación
        student.child.currentSLP = null;
        await student.save();
        // Decrementar contador del SLP
        await User_1.User.findByIdAndUpdate(slpId, {
            $inc: { 'slp.caseloadCount': -1 }
        });
        (0, responseUtils_1.sendSuccessResponse)(res, student, 'Estudiante removido exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.removeStudentFromSLP = removeStudentFromSLP;
//# sourceMappingURL=studentController.js.map