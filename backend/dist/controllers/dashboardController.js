"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCaseload = exports.getUpcomingSessions = exports.getRecentSessions = exports.getDashboardStats = void 0;
const User_1 = require("../models/User");
const TherapySession_1 = require("../models/TherapySession");
const responseUtils_1 = require("../utils/responseUtils");
// Clase de error simple para evitar problemas de importación
class AuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthenticationError';
    }
}
// Controlador para obtener estadísticas del dashboard
const getDashboardStats = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AuthenticationError('Usuario no autenticado');
        }
        const userId = req.user._id;
        const userRole = req.user.role;
        let stats;
        if (userRole === 'slp') {
            // Estadísticas para SLP
            const totalSessions = await TherapySession_1.TherapySession.countDocuments({
                slpId: userId
            });
            const activeSessions = await TherapySession_1.TherapySession.countDocuments({
                slpId: userId,
                status: 'active'
            });
            const totalStudents = await User_1.User.countDocuments({
                role: 'child',
                'child.currentSLP': userId
            });
            const completedSessions = await TherapySession_1.TherapySession.find({
                slpId: userId,
                status: 'completed'
            });
            // Usar datos básicos por ahora
            const gamesPlayed = completedSessions.length * 2; // Promedio de 2 juegos por sesión
            const averageAccuracy = 85; // Placeholder
            const totalTime = completedSessions.length * 45; // Promedio de 45 min por sesión
            stats = {
                totalSessions,
                activeSessions,
                totalStudents,
                gamesPlayed,
                averageAccuracy,
                totalTime
            };
        }
        else {
            // Estadísticas para Child
            const totalSessions = await TherapySession_1.TherapySession.countDocuments({
                childId: userId
            });
            const activeSessions = await TherapySession_1.TherapySession.countDocuments({
                childId: userId,
                status: 'active'
            });
            const totalStudents = 1; // El niño mismo
            const completedSessions = await TherapySession_1.TherapySession.find({
                childId: userId,
                status: 'completed'
            });
            // Usar datos básicos por ahora
            const gamesPlayed = completedSessions.length * 2; // Promedio de 2 juegos por sesión
            const averageAccuracy = 85; // Placeholder
            const totalTime = completedSessions.length * 45; // Promedio de 45 min por sesión
            stats = {
                totalSessions,
                activeSessions,
                totalStudents,
                gamesPlayed,
                averageAccuracy,
                totalTime
            };
        }
        (0, responseUtils_1.sendSuccessResponse)(res, stats, 'Estadísticas del dashboard obtenidas');
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
// Controlador para obtener sesiones recientes
const getRecentSessions = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AuthenticationError('Usuario no autenticado');
        }
        const userId = req.user._id;
        const userRole = req.user.role;
        let sessions;
        if (userRole === 'slp') {
            // Sesiones recientes para SLP
            sessions = await TherapySession_1.TherapySession.find({ slpId: userId })
                .populate('childId', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(5);
        }
        else {
            // Sesiones recientes para Child
            sessions = await TherapySession_1.TherapySession.find({ childId: userId })
                .populate('slpId', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(5);
        }
        const recentSessions = sessions.map(session => ({
            id: session._id.toString(),
            studentName: userRole === 'slp'
                ? `${session.childId.firstName} ${session.childId.lastName}`
                : `${session.slpId.firstName} ${session.slpId.lastName}`,
            date: session.createdAt.toISOString().split('T')[0],
            duration: `45 min`, // Placeholder
            accuracy: 85, // Placeholder
            status: session.status
        }));
        (0, responseUtils_1.sendSuccessResponse)(res, recentSessions, 'Sesiones recientes obtenidas');
    }
    catch (error) {
        next(error);
    }
};
exports.getRecentSessions = getRecentSessions;
// Controlador para obtener próximas sesiones
const getUpcomingSessions = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AuthenticationError('Usuario no autenticado');
        }
        const userId = req.user._id;
        const userRole = req.user.role;
        let sessions;
        if (userRole === 'slp') {
            // Próximas sesiones para SLP
            sessions = await TherapySession_1.TherapySession.find({
                slpId: userId,
                status: 'scheduled',
                scheduledDate: { $gte: new Date() }
            })
                .populate('childId', 'firstName lastName')
                .sort({ scheduledDate: 1 })
                .limit(5);
        }
        else {
            // Próximas sesiones para Child
            sessions = await TherapySession_1.TherapySession.find({
                childId: userId,
                status: 'scheduled',
                scheduledDate: { $gte: new Date() }
            })
                .populate('slpId', 'firstName lastName')
                .sort({ scheduledDate: 1 })
                .limit(5);
        }
        const upcomingSessions = sessions.map(session => ({
            id: session._id.toString(),
            studentName: userRole === 'slp'
                ? `${session.childId.firstName} ${session.childId.lastName}`
                : `${session.slpId.firstName} ${session.slpId.lastName}`,
            date: session.scheduledDate.toISOString().split('T')[0] || '',
            time: session.scheduledDate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            type: 'Terapia del Habla' // Placeholder
        }));
        (0, responseUtils_1.sendSuccessResponse)(res, upcomingSessions, 'Próximas sesiones obtenidas');
    }
    catch (error) {
        next(error);
    }
};
exports.getUpcomingSessions = getUpcomingSessions;
// Controlador para obtener lista de estudiantes (caseload) para SLP
const getCaseload = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'slp') {
            throw new AuthenticationError('Acceso denegado - Solo para SLP');
        }
        const slpId = req.user._id;
        const students = await User_1.User.find({
            role: 'child',
            'child.currentSLP': slpId
        }).select('firstName lastName email child.skillLevel child.sessionsCompleted child.totalSessionTime');
        const caseload = students.map(student => ({
            id: student._id.toString(),
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            skillLevel: student.child?.skillLevel,
            sessionsCompleted: student.child?.sessionsCompleted || 0,
            totalSessionTime: student.child?.totalSessionTime || 0
        }));
        (0, responseUtils_1.sendSuccessResponse)(res, caseload, 'Caseload obtenido');
    }
    catch (error) {
        next(error);
    }
};
exports.getCaseload = getCaseload;
//# sourceMappingURL=dashboardController.js.map