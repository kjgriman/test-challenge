import { Request, Response, NextFunction } from 'express';
import { VideoRoom } from '../models/VideoRoom';
import { User } from '../models/User';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseUtils';

// Crear una nueva sala de videoconferencia
export const createVideoRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendErrorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const { sessionId, title } = req.body;
    const userId = req.user._id;

    // Generar roomId único
    const roomId = VideoRoom.generateRoomId();

    // Crear la sala
    const videoRoom = new VideoRoom({
      roomId,
      sessionId: sessionId || `session_${Date.now()}`,
      title: title || 'Sala de Terapia',
      createdBy: userId,
      participants: [{
        userId,
        name: `${req.user.firstName} ${req.user.lastName}`,
        role: req.user.role,
        joinedAt: new Date(),
        isActive: true
      }]
    });

    await videoRoom.save();

    sendSuccessResponse(res, {
      roomId: videoRoom.roomId,
      sessionId: videoRoom.sessionId,
      title: videoRoom.title,
      participants: videoRoom.getActiveParticipants()
    }, 'Sala de videoconferencia creada exitosamente');

  } catch (error) {
    next(error);
  }
};

// Obtener sala por roomId
export const getVideoRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendErrorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const { roomId } = req.params;

    const videoRoom = await VideoRoom.findOne({ roomId, isActive: true })
      .populate('participants.userId', 'firstName lastName role');

    if (!videoRoom) {
      sendErrorResponse(res, 'Sala no encontrada', 404);
      return;
    }

    sendSuccessResponse(res, {
      roomId: videoRoom.roomId,
      sessionId: videoRoom.sessionId,
      title: videoRoom.title,
      participants: videoRoom.getActiveParticipants(),
      maxParticipants: videoRoom.maxParticipants
    }, 'Sala obtenida exitosamente');

  } catch (error) {
    next(error);
  }
};

// Unirse a una sala
export const joinVideoRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendErrorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const { roomId } = req.params;
    const userId = req.user._id;

    const videoRoom = await VideoRoom.findOne({ roomId, isActive: true });

    if (!videoRoom) {
      sendErrorResponse(res, 'Sala no encontrada', 404);
      return;
    }

    // Verificar si la sala está llena
    const activeParticipants = videoRoom.getActiveParticipants();
    if (activeParticipants.length >= videoRoom.maxParticipants) {
      sendErrorResponse(res, 'Sala llena', 400);
      return;
    }

    // Agregar participante
    await videoRoom.addParticipant(
      userId,
      `${req.user.firstName} ${req.user.lastName}`,
      req.user.role
    );

    // Emitir evento WebSocket para notificar a otros participantes
    // TODO: Implementar WebSocket

    sendSuccessResponse(res, {
      roomId: videoRoom.roomId,
      participants: videoRoom.getActiveParticipants()
    }, 'Te has unido a la sala exitosamente');

  } catch (error) {
    next(error);
  }
};

// Salir de una sala
export const leaveVideoRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendErrorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const { roomId } = req.params;
    const userId = req.user._id;

    const videoRoom = await VideoRoom.findOne({ roomId, isActive: true });

    if (!videoRoom) {
      sendErrorResponse(res, 'Sala no encontrada', 404);
      return;
    }

    // Remover participante
    await videoRoom.removeParticipant(userId);

    // Emitir evento WebSocket para notificar a otros participantes
    // TODO: Implementar WebSocket

    sendSuccessResponse(res, {
      roomId: videoRoom.roomId,
      participants: videoRoom.getActiveParticipants()
    }, 'Has salido de la sala exitosamente');

  } catch (error) {
    next(error);
  }
};

// Obtener salas activas del usuario
export const getUserVideoRooms = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendErrorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const userId = req.user._id;

    const videoRooms = await VideoRoom.find({
      'participants.userId': userId,
      isActive: true
    }).populate('participants.userId', 'firstName lastName role');

    const rooms = videoRooms.map(room => ({
      roomId: room.roomId,
      sessionId: room.sessionId,
      title: room.title,
      participants: room.getActiveParticipants(),
      isCreator: room.createdBy.toString() === userId.toString()
    }));

    sendSuccessResponse(res, rooms, 'Salas obtenidas exitosamente');

  } catch (error) {
    next(error);
  }
};

// Cerrar una sala (solo el creador)
export const closeVideoRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendErrorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const { roomId } = req.params;
    const userId = req.user._id;

    const videoRoom = await VideoRoom.findOne({ roomId, isActive: true });

    if (!videoRoom) {
      sendErrorResponse(res, 'Sala no encontrada', 404);
      return;
    }

    // Verificar que el usuario sea el creador
    if (videoRoom.createdBy.toString() !== userId.toString()) {
      sendErrorResponse(res, 'Solo el creador puede cerrar la sala', 403);
      return;
    }

    // Cerrar la sala
    videoRoom.isActive = false;
    await videoRoom.save();

    // Emitir evento WebSocket para notificar a todos los participantes
    // TODO: Implementar WebSocket

    sendSuccessResponse(res, { roomId: videoRoom.roomId }, 'Sala cerrada exitosamente');

  } catch (error) {
    next(error);
  }
};
