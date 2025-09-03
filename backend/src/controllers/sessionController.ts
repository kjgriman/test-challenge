import { Request, Response, NextFunction } from 'express';
import { TherapySession, SessionStatus } from '../models/TherapySession';
import { User } from '../models/User';
import { sendSuccessResponse } from '../utils/responseUtils';
import { ValidationError, NotFoundError } from '../utils/errors';
import { NotificationService } from '../services/NotificationService';

// Tipos para las sesiones
interface CreateSessionData {
  childId: string;
  scheduledDate: Date;
  duration: number;
  sessionType: 'therapy' | 'evaluation' | 'game';
  notes?: string;
  goals?: string[];
}

interface UpdateSessionData {
  scheduledDate?: Date;
  duration?: number;
  sessionType?: 'therapy' | 'evaluation' | 'game';
  notes?: string;
  goals?: string[];
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

// Crear nueva sesión
export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('🎯 createSession iniciado');
    console.log('👤 Usuario:', req.user);
    console.log('📦 Body:', req.body);
    
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const slpId = req.user._id;
    const sessionData: CreateSessionData = req.body;

    console.log('🔍 Verificando estudiante:', sessionData.childId);

    // Validar que el niño existe
    const child = await User.findById(sessionData.childId);
    if (!child || child.role !== 'child') {
      console.log('❌ Estudiante no encontrado o rol incorrecto:', child);
      throw new NotFoundError('Estudiante no encontrado');
    }

    console.log('✅ Estudiante encontrado:', child.firstName, child.lastName);

    // Validar que la fecha no sea en el pasado
    const scheduledDate = new Date(sessionData.scheduledDate);
    if (scheduledDate < new Date()) {
      throw new ValidationError('La fecha programada no puede ser en el pasado');
    }

    console.log('📅 Fecha validada:', scheduledDate);

    // Crear la sesión
    const session = new TherapySession({
      slpId,
      childId: sessionData.childId,
      scheduledDate: scheduledDate,
      duration: sessionData.duration,
      sessionType: sessionData.sessionType,
      notes: sessionData.notes,
      goals: sessionData.goals,
      status: SessionStatus.SCHEDULED
    });

    console.log('💾 Guardando sesión...');
    await session.save();

    // Populate para obtener información completa
    await session.populate('childId', 'firstName lastName');
    await session.populate('slpId', 'firstName lastName');

    // Crear notificaciones para los usuarios involucrados
    try {
      await NotificationService.notifySessionCreated(session._id.toString());
    } catch (notificationError) {
      console.log('⚠️ Error creando notificaciones:', notificationError);
      // No fallar la operación principal por errores de notificación
    }

    console.log('✅ Sesión creada exitosamente:', session._id);
    sendSuccessResponse(res, session, 'Sesión creada exitosamente', 201);

  } catch (error) {
    console.log('❌ Error en createSession:', error);
    next(error);
  }
};

// Obtener todas las sesiones del usuario
export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }
    console.log('xxxxxxxxxxxxxxx');
    

    const userId = req.user._id;
    const userRole = req.user.role;
    const { status, page = 1, limit = 10 } = req.query;

    let query: any = {};
    
    // Filtrar por rol del usuario
    if (userRole === 'slp') {
      query.slpId = userId;
    } else {
      query.childId = userId;
    }

    // Filtrar por estado si se especifica
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const sessions = await TherapySession.find(query)
      .populate('childId', 'firstName lastName')
      .populate('slpId', 'firstName lastName')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(Number(limit));
      console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',sessions);
      

    const total = await TherapySession.countDocuments(query);

    sendSuccessResponse(res, {
      sessions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, 'Sesiones obtenidas exitosamente');

  } catch (error) {
    next(error);
  }
};

// Obtener sesión por ID
export const getSessionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const sessionId = req.params['id'];
    const userId = req.user._id;
    const userRole = req.user.role;

    const session = await TherapySession.findById(sessionId)
      .populate('childId', 'firstName lastName email child')
      .populate('slpId', 'firstName lastName email slp');

    if (!session) {
      throw new NotFoundError('Sesión no encontrada');
    }

    // Verificar permisos
    if (userRole === 'slp' && session.slpId.toString() !== userId.toString()) {
      throw new ValidationError('No tienes permisos para ver esta sesión');
    }

    if (userRole === 'child' && session.childId.toString() !== userId.toString()) {
      throw new ValidationError('No tienes permisos para ver esta sesión');
    }

    sendSuccessResponse(res, session, 'Sesión obtenida exitosamente');

  } catch (error) {
    next(error);
  }
};

// Actualizar sesión
export const updateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const sessionId = req.params['id'];
    const slpId = req.user._id;
    const updateData: UpdateSessionData = req.body;

    const session = await TherapySession.findById(sessionId);

    if (!session) {
      throw new NotFoundError('Sesión no encontrada');
    }

    // Verificar que el SLP es el propietario de la sesión
    if (session.slpId.toString() !== slpId.toString()) {
      throw new ValidationError('No tienes permisos para modificar esta sesión');
    }

    // Validar fecha si se está actualizando
    if (updateData.scheduledDate && updateData.scheduledDate < new Date()) {
      throw new ValidationError('La fecha programada no puede ser en el pasado');
    }

    // Actualizar la sesión
    Object.assign(session, updateData);
    await session.save();

    // Populate para obtener información completa
    await session.populate('childId', 'firstName lastName');
    await session.populate('slpId', 'firstName lastName');

    sendSuccessResponse(res, session, 'Sesión actualizada exitosamente');

  } catch (error) {
    next(error);
  }
};

// Eliminar sesión
export const deleteSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const sessionId = req.params['id'];
    const slpId = req.user._id;

    const session = await TherapySession.findById(sessionId);

    if (!session) {
      throw new NotFoundError('Sesión no encontrada');
    }

    // Verificar que el SLP es el propietario de la sesión
    if (session.slpId.toString() !== slpId.toString()) {
      throw new ValidationError('No tienes permisos para eliminar esta sesión');
    }

    // Solo permitir eliminar sesiones programadas
    if (session.status !== SessionStatus.SCHEDULED) {
      throw new ValidationError('Solo se pueden eliminar sesiones programadas');
    }

    // Crear notificaciones antes de eliminar la sesión
    try {
      await NotificationService.notifySessionCancelled(session._id.toString(), 'Sesión eliminada por el terapeuta');
    } catch (notificationError) {
      console.log('⚠️ Error creando notificaciones:', notificationError);
      // No fallar la operación principal por errores de notificación
    }

    await TherapySession.findByIdAndDelete(sessionId);

    sendSuccessResponse(res, null, 'Sesión eliminada exitosamente');

  } catch (error) {
    next(error);
  }
};

// Unirse a una sesión
export const joinSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const sessionId = req.params['id'];
    const userId = req.user._id;
    const userRole = req.user.role;

    const session = await TherapySession.findById(sessionId);

    if (!session) {
      throw new NotFoundError('Sesión no encontrada');
    }

    // Verificar que el usuario puede unirse a la sesión
    if (userRole === 'slp' && session.slpId.toString() !== userId.toString()) {
      throw new ValidationError('No puedes unirte a esta sesión');
    }

    if (userRole === 'child' && session.childId.toString() !== userId.toString()) {
      throw new ValidationError('No puedes unirte a esta sesión');
    }

    // Verificar que la sesión esté activa
    if (session.status !== SessionStatus.IN_PROGRESS) {
      throw new ValidationError('La sesión no está activa');
    }

    sendSuccessResponse(res, { sessionId }, 'Te has unido a la sesión exitosamente');

  } catch (error) {
    next(error);
  }
};

// Salir de una sesión
export const leaveSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const sessionId = req.params['id'];

    const session = await TherapySession.findById(sessionId);

    if (!session) {
      throw new NotFoundError('Sesión no encontrada');
    }

    sendSuccessResponse(res, { sessionId }, 'Has salido de la sesión exitosamente');

  } catch (error) {
    next(error);
  }
};

// Iniciar sesión
export const startSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const sessionId = req.params['id'];
    const slpId = req.user._id;

    const session = await TherapySession.findById(sessionId);

    if (!session) {
      throw new NotFoundError('Sesión no encontrada');
    }

    // Verificar que el SLP es el propietario de la sesión
    if (session.slpId.toString() !== slpId.toString()) {
      throw new ValidationError('No tienes permisos para iniciar esta sesión');
    }

    // Verificar que la sesión esté programada
    if (session.status !== SessionStatus.SCHEDULED) {
      throw new ValidationError('Solo se pueden iniciar sesiones programadas');
    }

    // Actualizar estado y agregar hora de inicio
    session.status = SessionStatus.IN_PROGRESS;
    session.startTime = new Date();
    await session.save();

    // Crear notificaciones para los usuarios involucrados
    try {
      await NotificationService.notifySessionStarted(session._id.toString());
    } catch (notificationError) {
      console.log('⚠️ Error creando notificaciones:', notificationError);
      // No fallar la operación principal por errores de notificación
    }

    sendSuccessResponse(res, session, 'Sesión iniciada exitosamente');

  } catch (error) {
    next(error);
  }
};

// Finalizar sesión
export const endSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('🎯 endSession iniciado');
    console.log('👤 Usuario:', req.user);
    console.log('📦 Body:', req.body);
    console.log('🔗 Params:', req.params);
    
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const sessionId = req.params['id'];
    const slpId = req.user._id;
    const { notes, gamesPlayed, accuracy } = req.body;

    console.log('🆔 Session ID:', sessionId);
    console.log('👨‍⚕️ SLP ID:', slpId);
    console.log('📝 Notes:', notes);
    console.log('🎮 Games Played:', gamesPlayed);
    console.log('🎯 Accuracy:', accuracy);

    const session = await TherapySession.findById(sessionId);

    if (!session) {
      throw new NotFoundError('Sesión no encontrada');
    }
    
    console.log('📋 Sesión encontrada:', {
      _id: session._id,
      status: session.status,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      slpId: session.slpId,
      childId: session.childId
    });

    // Verificar que el SLP es el propietario de la sesión
    if (session.slpId.toString() !== slpId.toString()) {
      console.log('❌ Error de permisos - SLP ID de sesión:', session.slpId.toString(), 'vs SLP ID del usuario:', slpId.toString());
      throw new ValidationError('No tienes permisos para finalizar esta sesión');
    }

    // Verificar que la sesión esté en progreso
    if (session.status !== SessionStatus.IN_PROGRESS) {
      console.log('❌ Error de estado - Estado actual:', session.status, 'vs Estado requerido:', SessionStatus.IN_PROGRESS);
      throw new ValidationError('Solo se pueden finalizar sesiones en progreso');
    }

    console.log('✅ Validaciones pasadas, actualizando sesión...');

    // Actualizar sesión
    session.status = SessionStatus.COMPLETED;
    session.endTime = new Date();
    if (notes) session.notes = notes;
    if (gamesPlayed !== undefined) session.gamesPlayed = gamesPlayed;
    if (accuracy !== undefined) session.accuracy = accuracy;

    console.log('⏰ Hora de fin establecida:', session.endTime);
    console.log('📝 Notas actualizadas:', session.notes);
    console.log('🎮 Juegos jugados actualizados:', session.gamesPlayed);
    console.log('🎯 Precisión actualizada:', session.accuracy);

    // Calcular duración real
    if (session.startTime && session.endTime) {
      const startTimeMs = session.startTime.getTime();
      const endTimeMs = session.endTime.getTime();
      const timeDiffMs = endTimeMs - startTimeMs;
      const calculatedDuration = Math.round(timeDiffMs / 60000);
      
      console.log('⏱️ Cálculo de duración:');
      console.log('   - Hora de inicio:', session.startTime);
      console.log('   - Hora de fin:', session.endTime);
      console.log('   - Diferencia en ms:', timeDiffMs);
      console.log('   - Duración calculada (minutos):', calculatedDuration);
      
      // Verificar que la duración no exceda el límite máximo (3 horas = 180 minutos)
      if (calculatedDuration > 180) {
        console.log('❌ Duración excede límite - Calculada:', calculatedDuration, 'minutos vs Límite:', 180, 'minutos');
        console.log('⚠️ Sesión iniciada hace mucho tiempo, estableciendo duración máxima');
        
        // Para sesiones que se iniciaron hace mucho tiempo, establecer la duración máxima
        session.duration = 180;
        console.log('✅ Duración establecida al límite máximo:', session.duration, 'minutos');
      } else {
        session.duration = calculatedDuration;
        console.log('✅ Duración establecida:', session.duration, 'minutos');
      }
    } else {
      console.log('⚠️ No se pudo calcular duración - startTime:', session.startTime, 'endTime:', session.endTime);
    }

    console.log('💾 Guardando sesión...');
    await session.save();
    console.log('✅ Sesión guardada exitosamente');

    // Crear notificaciones para los usuarios involucrados
    try {
      await NotificationService.notifySessionCompleted(session._id.toString(), accuracy);
    } catch (notificationError) {
      console.log('⚠️ Error creando notificaciones:', notificationError);
      // No fallar la operación principal por errores de notificación
    }

    sendSuccessResponse(res, session, 'Sesión finalizada exitosamente');

  } catch (error) {
    console.log('❌ Error en endSession:', error);
    next(error);
  }
};

// Obtener participantes de una sesión
export const getSessionParticipants = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const sessionId = req.params['id'];
    const userId = req.user._id;
    const userRole = req.user.role;

    const session = await TherapySession.findById(sessionId)
      .populate('childId', 'firstName lastName email')
      .populate('slpId', 'firstName lastName email');

    if (!session) {
      throw new NotFoundError('Sesión no encontrada');
    }

    // Verificar permisos
    if (userRole === 'slp' && session.slpId.toString() !== userId.toString()) {
      throw new ValidationError('No tienes permisos para ver esta sesión');
    }

    if (userRole === 'child' && session.childId.toString() !== userId.toString()) {
      throw new ValidationError('No tienes permisos para ver esta sesión');
    }

    const participants = {
      slp: session.slpId,
      child: session.childId
    };

    sendSuccessResponse(res, participants, 'Participantes obtenidos exitosamente');

  } catch (error) {
    next(error);
  }
};
