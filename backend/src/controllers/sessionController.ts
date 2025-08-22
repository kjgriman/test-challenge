import { Request, Response, NextFunction } from 'express';
import { TherapySession, SessionStatus } from '../models/TherapySession';
import { User } from '../models/User';
import { sendSuccessResponse } from '../utils/responseUtils';
import { ValidationError, NotFoundError } from '../utils/errors';

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
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const slpId = req.user._id;
    const sessionData: CreateSessionData = req.body;

    // Validar que el niño existe
    const child = await User.findById(sessionData.childId);
    if (!child || child.role !== 'child') {
      throw new NotFoundError('Estudiante no encontrado');
    }

    // Validar que la fecha no sea en el pasado
    if (sessionData.scheduledDate < new Date()) {
      throw new ValidationError('La fecha programada no puede ser en el pasado');
    }

    // Crear la sesión
    const session = new TherapySession({
      slpId,
      childId: sessionData.childId,
      scheduledDate: sessionData.scheduledDate,
      duration: sessionData.duration,
      sessionType: sessionData.sessionType,
      notes: sessionData.notes,
      goals: sessionData.goals,
      status: SessionStatus.SCHEDULED
    });

    await session.save();

    // Populate para obtener información completa
    await session.populate('childId', 'firstName lastName');
    await session.populate('slpId', 'firstName lastName');

    sendSuccessResponse(res, session, 'Sesión creada exitosamente', 201);

  } catch (error) {
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
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const sessionId = req.params['id'];
    const slpId = req.user._id;
    const { notes, gamesPlayed, accuracy } = req.body;

    const session = await TherapySession.findById(sessionId);

    if (!session) {
      throw new NotFoundError('Sesión no encontrada');
    }

    // Verificar que el SLP es el propietario de la sesión
    if (session.slpId.toString() !== slpId.toString()) {
      throw new ValidationError('No tienes permisos para finalizar esta sesión');
    }

    // Verificar que la sesión esté en progreso
    if (session.status !== SessionStatus.IN_PROGRESS) {
      throw new ValidationError('Solo se pueden finalizar sesiones en progreso');
    }

    // Actualizar sesión
    session.status = SessionStatus.COMPLETED;
    session.endTime = new Date();
    if (notes) session.notes = notes;
    if (gamesPlayed !== undefined) session.gamesPlayed = gamesPlayed;
    if (accuracy !== undefined) session.accuracy = accuracy;

    // Calcular duración real
    if (session.startTime && session.endTime) {
      session.duration = Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000);
    }

    await session.save();

    sendSuccessResponse(res, session, 'Sesión finalizada exitosamente');

  } catch (error) {
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
