import { Request, Response, NextFunction } from 'express';
import { TherapySession } from '../models/TherapySession';
import { User } from '../models/User';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseUtils';

// Iniciar video en una sesión
export const startVideoSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendErrorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const { sessionId } = req.params;
    const userId = req.user._id;

    // Buscar la sesión
    const session = await TherapySession.findById(sessionId);
    if (!session) {
      sendErrorResponse(res, 'Sesión no encontrada', 404);
      return;
    }

    // Verificar que el usuario es parte de la sesión
    if (session.slpId.toString() !== userId.toString() && 
        session.childId.toString() !== userId.toString()) {
      sendErrorResponse(res, 'No tienes permisos para esta sesión', 403);
      return;
    }

    // Verificar que la sesión está en progreso
    if (session.status !== 'in_progress') {
      sendErrorResponse(res, 'La sesión debe estar en progreso para iniciar video', 400);
      return;
    }

    // Iniciar video
    await session.startVideo();

    // Agregar al usuario como participante
    await session.addVideoParticipant(
      userId,
      `${req.user.firstName} ${req.user.lastName}`,
      req.user.role
    );

    sendSuccessResponse(res, {
      sessionId: session._id,
      videoRoomId: session.videoRoomId,
      participants: session.getActiveVideoParticipants()
    }, 'Video iniciado exitosamente');

  } catch (error) {
    next(error);
  }
};

// Unirse al video de una sesión
export const joinVideoSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendErrorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const { sessionId } = req.params;
    const userId = req.user._id;

    // Buscar la sesión
    const session = await TherapySession.findById(sessionId);
    if (!session) {
      sendErrorResponse(res, 'Sesión no encontrada', 404);
      return;
    }

    // Verificar que el usuario es parte de la sesión
    if (session.slpId.toString() !== userId.toString() && 
        session.childId.toString() !== userId.toString()) {
      sendErrorResponse(res, 'No tienes permisos para esta sesión', 403);
      return;
    }

    // Verificar que el video está habilitado
    if (!session.videoEnabled) {
      sendErrorResponse(res, 'El video no está habilitado para esta sesión', 400);
      return;
    }

    // Agregar al usuario como participante
    await session.addVideoParticipant(
      userId,
      `${req.user.firstName} ${req.user.lastName}`,
      req.user.role
    );

    sendSuccessResponse(res, {
      sessionId: session._id,
      videoRoomId: session.videoRoomId,
      participants: session.getActiveVideoParticipants()
    }, 'Te has unido al video exitosamente');

  } catch (error) {
    next(error);
  }
};

// Salir del video de una sesión
export const leaveVideoSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendErrorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const { sessionId } = req.params;
    const userId = req.user._id;

    // Buscar la sesión
    const session = await TherapySession.findById(sessionId);
    if (!session) {
      sendErrorResponse(res, 'Sesión no encontrada', 404);
      return;
    }

    // Remover al usuario como participante
    await session.removeVideoParticipant(userId);

    sendSuccessResponse(res, {
      sessionId: session._id,
      participants: session.getActiveVideoParticipants()
    }, 'Has salido del video exitosamente');

  } catch (error) {
    next(error);
  }
};

// Terminar video de una sesión
export const endVideoSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendErrorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const { sessionId } = req.params;
    const userId = req.user._id;

    // Buscar la sesión
    const session = await TherapySession.findById(sessionId);
    if (!session) {
      sendErrorResponse(res, 'Sesión no encontrada', 404);
      return;
    }

    // Verificar que el usuario es el SLP (solo el SLP puede terminar el video)
    if (session.slpId.toString() !== userId.toString()) {
      sendErrorResponse(res, 'Solo el terapeuta puede terminar el video', 403);
      return;
    }

    // Terminar video
    await session.endVideo();

    sendSuccessResponse(res, {
      sessionId: session._id,
      videoEndedAt: session.videoEndedAt
    }, 'Video terminado exitosamente');

  } catch (error) {
    next(error);
  }
};

// Obtener información del video de una sesión
export const getVideoSessionInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendErrorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const { sessionId } = req.params;
    const userId = req.user._id;

    // Buscar la sesión
    const session = await TherapySession.findById(sessionId);
    if (!session) {
      sendErrorResponse(res, 'Sesión no encontrada', 404);
      return;
    }

    // Verificar que el usuario es parte de la sesión
    if (session.slpId.toString() !== userId.toString() && 
        session.childId.toString() !== userId.toString()) {
      sendErrorResponse(res, 'No tienes permisos para esta sesión', 403);
      return;
    }

    sendSuccessResponse(res, {
      sessionId: session._id,
      videoEnabled: session.videoEnabled,
      videoRoomId: session.videoRoomId,
      videoStartedAt: session.videoStartedAt,
      videoEndedAt: session.videoEndedAt,
      participants: session.getActiveVideoParticipants()
    }, 'Información del video obtenida exitosamente');

  } catch (error) {
    next(error);
  }
};
