"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionParticipants = exports.endSession = exports.startSession = exports.leaveSession = exports.joinSession = exports.deleteSession = exports.updateSession = exports.getSessionById = exports.getSessions = exports.createSession = void 0;
const TherapySession_1 = require("../models/TherapySession");
const User_1 = require("../models/User");
const responseUtils_1 = require("../utils/responseUtils");
const errors_1 = require("../utils/errors");
// Crear nueva sesión
const createSession = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const slpId = req.user._id;
        const sessionData = req.body;
        // Validar que el niño existe
        const child = await User_1.User.findById(sessionData.childId);
        if (!child || child.role !== 'child') {
            throw new errors_1.NotFoundError('Estudiante no encontrado');
        }
        // Validar que la fecha no sea en el pasado
        if (sessionData.scheduledDate < new Date()) {
            throw new errors_1.ValidationError('La fecha programada no puede ser en el pasado');
        }
        // Crear la sesión
        const session = new TherapySession_1.TherapySession({
            slpId,
            childId: sessionData.childId,
            scheduledDate: sessionData.scheduledDate,
            duration: sessionData.duration,
            sessionType: sessionData.sessionType,
            notes: sessionData.notes,
            goals: sessionData.goals,
            status: TherapySession_1.SessionStatus.SCHEDULED
        });
        await session.save();
        // Populate para obtener información completa
        await session.populate('childId', 'firstName lastName');
        await session.populate('slpId', 'firstName lastName');
        (0, responseUtils_1.sendSuccessResponse)(res, session, 'Sesión creada exitosamente', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createSession = createSession;
// Obtener todas las sesiones del usuario
const getSessions = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const userId = req.user._id;
        const userRole = req.user.role;
        const { status, page = 1, limit = 10 } = req.query;
        let query = {};
        // Filtrar por rol del usuario
        if (userRole === 'slp') {
            query.slpId = userId;
        }
        else {
            query.childId = userId;
        }
        // Filtrar por estado si se especifica
        if (status) {
            query.status = status;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sessions = await TherapySession_1.TherapySession.find(query)
            .populate('childId', 'firstName lastName')
            .populate('slpId', 'firstName lastName')
            .sort({ scheduledDate: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await TherapySession_1.TherapySession.countDocuments(query);
        (0, responseUtils_1.sendSuccessResponse)(res, {
            sessions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }, 'Sesiones obtenidas exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.getSessions = getSessions;
// Obtener sesión por ID
const getSessionById = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const sessionId = req.params['id'];
        const userId = req.user._id;
        const userRole = req.user.role;
        const session = await TherapySession_1.TherapySession.findById(sessionId)
            .populate('childId', 'firstName lastName email child')
            .populate('slpId', 'firstName lastName email slp');
        if (!session) {
            throw new errors_1.NotFoundError('Sesión no encontrada');
        }
        // Verificar permisos
        if (userRole === 'slp' && session.slpId.toString() !== userId.toString()) {
            throw new errors_1.ValidationError('No tienes permisos para ver esta sesión');
        }
        if (userRole === 'child' && session.childId.toString() !== userId.toString()) {
            throw new errors_1.ValidationError('No tienes permisos para ver esta sesión');
        }
        (0, responseUtils_1.sendSuccessResponse)(res, session, 'Sesión obtenida exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.getSessionById = getSessionById;
// Actualizar sesión
const updateSession = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const sessionId = req.params['id'];
        const slpId = req.user._id;
        const updateData = req.body;
        const session = await TherapySession_1.TherapySession.findById(sessionId);
        if (!session) {
            throw new errors_1.NotFoundError('Sesión no encontrada');
        }
        // Verificar que el SLP es el propietario de la sesión
        if (session.slpId.toString() !== slpId.toString()) {
            throw new errors_1.ValidationError('No tienes permisos para modificar esta sesión');
        }
        // Validar fecha si se está actualizando
        if (updateData.scheduledDate && updateData.scheduledDate < new Date()) {
            throw new errors_1.ValidationError('La fecha programada no puede ser en el pasado');
        }
        // Actualizar la sesión
        Object.assign(session, updateData);
        await session.save();
        // Populate para obtener información completa
        await session.populate('childId', 'firstName lastName');
        await session.populate('slpId', 'firstName lastName');
        (0, responseUtils_1.sendSuccessResponse)(res, session, 'Sesión actualizada exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.updateSession = updateSession;
// Eliminar sesión
const deleteSession = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const sessionId = req.params['id'];
        const slpId = req.user._id;
        const session = await TherapySession_1.TherapySession.findById(sessionId);
        if (!session) {
            throw new errors_1.NotFoundError('Sesión no encontrada');
        }
        // Verificar que el SLP es el propietario de la sesión
        if (session.slpId.toString() !== slpId.toString()) {
            throw new errors_1.ValidationError('No tienes permisos para eliminar esta sesión');
        }
        // Solo permitir eliminar sesiones programadas
        if (session.status !== TherapySession_1.SessionStatus.SCHEDULED) {
            throw new errors_1.ValidationError('Solo se pueden eliminar sesiones programadas');
        }
        await TherapySession_1.TherapySession.findByIdAndDelete(sessionId);
        (0, responseUtils_1.sendSuccessResponse)(res, null, 'Sesión eliminada exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSession = deleteSession;
// Unirse a una sesión
const joinSession = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const sessionId = req.params['id'];
        const userId = req.user._id;
        const userRole = req.user.role;
        const session = await TherapySession_1.TherapySession.findById(sessionId);
        if (!session) {
            throw new errors_1.NotFoundError('Sesión no encontrada');
        }
        // Verificar que el usuario puede unirse a la sesión
        if (userRole === 'slp' && session.slpId.toString() !== userId.toString()) {
            throw new errors_1.ValidationError('No puedes unirte a esta sesión');
        }
        if (userRole === 'child' && session.childId.toString() !== userId.toString()) {
            throw new errors_1.ValidationError('No puedes unirte a esta sesión');
        }
        // Verificar que la sesión esté activa
        if (session.status !== TherapySession_1.SessionStatus.IN_PROGRESS) {
            throw new errors_1.ValidationError('La sesión no está activa');
        }
        (0, responseUtils_1.sendSuccessResponse)(res, { sessionId }, 'Te has unido a la sesión exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.joinSession = joinSession;
// Salir de una sesión
const leaveSession = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const sessionId = req.params['id'];
        const session = await TherapySession_1.TherapySession.findById(sessionId);
        if (!session) {
            throw new errors_1.NotFoundError('Sesión no encontrada');
        }
        (0, responseUtils_1.sendSuccessResponse)(res, { sessionId }, 'Has salido de la sesión exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.leaveSession = leaveSession;
// Iniciar sesión
const startSession = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const sessionId = req.params['id'];
        const slpId = req.user._id;
        const session = await TherapySession_1.TherapySession.findById(sessionId);
        if (!session) {
            throw new errors_1.NotFoundError('Sesión no encontrada');
        }
        // Verificar que el SLP es el propietario de la sesión
        if (session.slpId.toString() !== slpId.toString()) {
            throw new errors_1.ValidationError('No tienes permisos para iniciar esta sesión');
        }
        // Verificar que la sesión esté programada
        if (session.status !== TherapySession_1.SessionStatus.SCHEDULED) {
            throw new errors_1.ValidationError('Solo se pueden iniciar sesiones programadas');
        }
        // Actualizar estado y agregar hora de inicio
        session.status = TherapySession_1.SessionStatus.IN_PROGRESS;
        session.startTime = new Date();
        await session.save();
        (0, responseUtils_1.sendSuccessResponse)(res, session, 'Sesión iniciada exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.startSession = startSession;
// Finalizar sesión
const endSession = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const sessionId = req.params['id'];
        const slpId = req.user._id;
        const { notes, gamesPlayed, accuracy } = req.body;
        const session = await TherapySession_1.TherapySession.findById(sessionId);
        if (!session) {
            throw new errors_1.NotFoundError('Sesión no encontrada');
        }
        // Verificar que el SLP es el propietario de la sesión
        if (session.slpId.toString() !== slpId.toString()) {
            throw new errors_1.ValidationError('No tienes permisos para finalizar esta sesión');
        }
        // Verificar que la sesión esté en progreso
        if (session.status !== TherapySession_1.SessionStatus.IN_PROGRESS) {
            throw new errors_1.ValidationError('Solo se pueden finalizar sesiones en progreso');
        }
        // Actualizar sesión
        session.status = TherapySession_1.SessionStatus.COMPLETED;
        session.endTime = new Date();
        if (notes)
            session.notes = notes;
        if (gamesPlayed !== undefined)
            session.gamesPlayed = gamesPlayed;
        if (accuracy !== undefined)
            session.accuracy = accuracy;
        // Calcular duración real
        if (session.startTime && session.endTime) {
            session.duration = Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000);
        }
        await session.save();
        (0, responseUtils_1.sendSuccessResponse)(res, session, 'Sesión finalizada exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.endSession = endSession;
// Obtener participantes de una sesión
const getSessionParticipants = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ValidationError('Usuario no autenticado');
        }
        const sessionId = req.params['id'];
        const userId = req.user._id;
        const userRole = req.user.role;
        const session = await TherapySession_1.TherapySession.findById(sessionId)
            .populate('childId', 'firstName lastName email')
            .populate('slpId', 'firstName lastName email');
        if (!session) {
            throw new errors_1.NotFoundError('Sesión no encontrada');
        }
        // Verificar permisos
        if (userRole === 'slp' && session.slpId.toString() !== userId.toString()) {
            throw new errors_1.ValidationError('No tienes permisos para ver esta sesión');
        }
        if (userRole === 'child' && session.childId.toString() !== userId.toString()) {
            throw new errors_1.ValidationError('No tienes permisos para ver esta sesión');
        }
        const participants = {
            slp: session.slpId,
            child: session.childId
        };
        (0, responseUtils_1.sendSuccessResponse)(res, participants, 'Participantes obtenidos exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.getSessionParticipants = getSessionParticipants;
//# sourceMappingURL=sessionController.js.map