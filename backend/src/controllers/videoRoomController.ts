import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { VideoRoom } from '../models/VideoRoom';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseUtils';
import { asyncErrorHandler } from '../middleware/asyncErrorHandler';
import { OperationalError } from '../middleware/errorHandler';

// Crear una nueva sala de video
export const createVideoRoom = asyncErrorHandler(async (req: Request, res: Response) => {
  const { name, description, maxParticipants, settings } = req.body;
  const userId = (req as any).user.id;

  // Generar roomId único
  let roomId: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    roomId = (VideoRoom as any).generateRoomId();
    isUnique = await (VideoRoom as any).isRoomIdUnique(roomId);
    attempts++;
  }

  if (!isUnique) {
    return sendErrorResponse(res, 'No se pudo generar un identificador único para la sala', 500);
  }

  // Crear la sala
  const videoRoom = new VideoRoom({
    roomId,
    name,
    description,
    createdBy: userId,
    maxParticipants: maxParticipants || 10,
    settings: {
      allowScreenShare: settings?.allowScreenShare ?? true,
      allowChat: settings?.allowChat ?? true,
      allowRecording: settings?.allowRecording ?? false,
      requireApproval: settings?.requireApproval ?? false,
      isPublic: settings?.isPublic ?? true,
      allowGuests: settings?.allowGuests ?? true
    }
  });

  await videoRoom.save();

  // Agregar al creador como participante
  await (videoRoom as any).addParticipant(userId, (req as any).user.firstName + ' ' + (req as any).user.lastName, (req as any).user.role);

  return sendSuccessResponse(res, {
    videoRoom: {
      ...videoRoom.toJSON(),
      shareLink: (videoRoom as any).getShareLink()
    }
  }, 'Sala de video creada exitosamente');
});

// Obtener todas las salas de video del usuario
export const getVideoRooms = asyncErrorHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { page = 1, limit = 10, status, type = 'all' } = req.query;

  let query: any = {};

  if (type === 'my') {
    // Solo salas del usuario (creadas por él o donde participa)
    query = {
      $or: [
        { createdBy: userId },
        { 'participants.userId': userId }
      ]
    };
  } else if (type === 'public') {
    // Solo salas públicas creadas por otros usuarios
    query = {
      'settings.isPublic': true,
      createdBy: { $ne: userId },
      'participants.userId': { $ne: userId }
    };
  } else if (type === 'invited') {
    // Salas donde el usuario fue invitado
    query = {
      'invitations.userId': userId,
      'invitations.status': 'pending'
    };
  } else {
    // Todas las salas (mis salas + salas públicas + invitaciones)
    query = {
      $or: [
        { createdBy: userId },
        { 'participants.userId': userId },
        { 
          'settings.isPublic': true,
          createdBy: { $ne: userId },
          'participants.userId': { $ne: userId }
        },
        {
          'invitations.userId': userId,
          'invitations.status': 'pending'
        }
      ]
    };
  }

  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [videoRooms, total] = await Promise.all([
    VideoRoom.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('participants.userId', 'firstName lastName email')
      .populate('invitations.userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    VideoRoom.countDocuments(query)
  ]);

  return sendSuccessResponse(res, {
    videoRooms: videoRooms.map(room => ({
      ...room.toJSON(),
      shareLink: (room as any).getShareLink()
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  }, 'Salas de video obtenidas exitosamente');
});

// Obtener una sala de video específica
export const getVideoRoom = asyncErrorHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const userId = (req as any).user.id;

  console.log('🔍 Buscando sala:', roomId, 'para usuario:', userId);

  const videoRoom = await VideoRoom.findOne({ roomId })
    .populate('createdBy', 'firstName lastName')
    .populate('participants.userId', 'firstName lastName');

  if (!videoRoom) {
    console.log('❌ Sala no encontrada');
    return sendErrorResponse(res, 'Sala de video no encontrada', 404);
  }

  console.log('📋 Sala encontrada:', {
    createdBy: videoRoom.createdBy,
    participants: videoRoom.participants.map(p => ({ userId: p.userId, name: p.name })),
    userId: userId
  });

  // Verificar si el usuario tiene acceso a la sala
  const isCreator = videoRoom.createdBy.toString() === userId;
  const isParticipant = videoRoom.participants.some(p => p.userId.toString() === userId);

  console.log('🔐 Verificación de acceso:', {
    isCreator,
    isParticipant,
    hasAccess: isCreator || isParticipant
  });

  if (!isCreator && !isParticipant) {
    console.log('❌ Usuario no tiene acceso');
    return sendErrorResponse(res, 'No tienes acceso a esta sala', 403);
  }

  console.log('✅ Usuario tiene acceso');

  return sendSuccessResponse(res, {
    videoRoom: {
      ...videoRoom.toJSON(),
      shareLink: (videoRoom as any).getShareLink()
    }
  }, 'Sala de video obtenida exitosamente');
});

// Unirse a una sala de video
export const joinVideoRoom = asyncErrorHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const userId = (req as any).user.id;

  const videoRoom = await VideoRoom.findOne({ roomId });

  if (!videoRoom) {
    return sendErrorResponse(res, 'Sala de video no encontrada', 404);
  }

  if (!videoRoom.isActive) {
    return sendErrorResponse(res, 'La sala de video no está activa', 400);
  }

  // Verificar si requiere aprobación
  if (videoRoom.settings.requireApproval && videoRoom.createdBy.toString() !== userId) {
    // Aquí podrías implementar un sistema de solicitudes de aprobación
    return sendErrorResponse(res, 'Esta sala requiere aprobación del creador', 403);
  }

  // Agregar participante
  await (videoRoom as any).addParticipant(
    userId, 
    (req as any).user.firstName + ' ' + (req as any).user.lastName, 
    (req as any).user.role
  );

  return sendSuccessResponse(res, {
    videoRoom: {
      ...videoRoom.toJSON(),
      shareLink: (videoRoom as any).getShareLink()
    }
  }, 'Te has unido a la sala exitosamente');
});

// Iniciar una sala de video
export const startVideoRoom = asyncErrorHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const userId = (req as any).user.id;

  const videoRoom = await VideoRoom.findOne({ roomId });

  if (!videoRoom) {
    return sendErrorResponse(res, 'Sala de video no encontrada', 404);
  }

  if (videoRoom.createdBy.toString() !== userId) {
    return sendErrorResponse(res, 'Solo el creador puede iniciar la sala', 403);
  }

  if (videoRoom.isActive) {
    return sendErrorResponse(res, 'La sala ya está activa', 400);
  }

  await (videoRoom as any).startRoom();

  return sendSuccessResponse(res, {
    videoRoom: {
      ...videoRoom.toJSON(),
      shareLink: (videoRoom as any).getShareLink()
    }
  }, 'Sala iniciada exitosamente');
});

// Finalizar una sala de video
export const endVideoRoom = asyncErrorHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const userId = (req as any).user.id;

  const videoRoom = await VideoRoom.findOne({ roomId });

  if (!videoRoom) {
    return sendErrorResponse(res, 'Sala de video no encontrada', 404);
  }

  if (videoRoom.createdBy.toString() !== userId) {
    return sendErrorResponse(res, 'Solo el creador puede finalizar la sala', 403);
  }

  if (!videoRoom.isActive) {
    return sendErrorResponse(res, 'La sala no está activa', 400);
  }

  await (videoRoom as any).endRoom();

  return sendSuccessResponse(res, {
    videoRoom: {
      ...videoRoom.toJSON(),
      shareLink: (videoRoom as any).getShareLink()
    }
  }, 'Sala finalizada exitosamente');
});

// Salir de una sala de video
export const leaveVideoRoom = asyncErrorHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const userId = (req as any).user.id;

  const videoRoom = await VideoRoom.findOne({ roomId });

  if (!videoRoom) {
    return sendErrorResponse(res, 'Sala de video no encontrada', 404);
  }

  await (videoRoom as any).removeParticipant(userId);

  return sendSuccessResponse(res, {}, 'Has salido de la sala exitosamente');
});

// Eliminar una sala de video
export const deleteVideoRoom = asyncErrorHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const userId = (req as any).user.id;

  const videoRoom = await VideoRoom.findOne({ roomId });

  if (!videoRoom) {
    return sendErrorResponse(res, 'Sala de video no encontrada', 404);
  }

  if (videoRoom.createdBy.toString() !== userId) {
    return sendErrorResponse(res, 'Solo el creador puede eliminar la sala', 403);
  }

  await VideoRoom.deleteOne({ roomId });

  return sendSuccessResponse(res, {}, 'Sala eliminada exitosamente');
});

// Invitar usuario a sala de video
export const inviteToVideoRoom = asyncErrorHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const userId = (req as any).user.id;
  const { email, role = 'guest' } = req.body;

  const videoRoom = await VideoRoom.findOne({ roomId });
  if (!videoRoom) {
    throw new OperationalError('Sala de video no encontrada', 404);
  }

  if (videoRoom.createdBy.toString() !== userId) {
    throw new OperationalError('No tienes permisos para invitar usuarios a esta sala', 403);
  }

  // Buscar usuario por email
  const User = mongoose.model('User');
  const invitedUser = await User.findOne({ email });
  if (!invitedUser) {
    throw new OperationalError('Usuario no encontrado', 404);
  }

  // Verificar si ya está invitado
  const existingInvitation = videoRoom.invitations.find(
    inv => inv.userId.toString() === invitedUser._id.toString()
  );

  if (existingInvitation) {
    throw new OperationalError('El usuario ya está invitado a esta sala', 400);
  }

  // Verificar si ya es participante
  const existingParticipant = videoRoom.participants.find(
    p => p.userId.toString() === invitedUser._id.toString()
  );

  if (existingParticipant) {
    throw new OperationalError('El usuario ya es participante de esta sala', 400);
  }

  // Agregar invitación
  videoRoom.invitations.push({
    userId: invitedUser._id,
    email: invitedUser.email,
    role,
    invitedAt: new Date(),
    status: 'pending'
  });

  await videoRoom.save();

  return sendSuccessResponse(res, { 
    invitation: {
      userId: invitedUser._id,
      email: invitedUser.email,
      role,
      invitedAt: new Date(),
      status: 'pending'
    }
  }, 'Invitación enviada exitosamente');
});

// Aceptar invitación a sala de video
export const acceptVideoRoomInvitation = asyncErrorHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const userId = (req as any).user.id;

  const videoRoom = await VideoRoom.findOne({ roomId });
  if (!videoRoom) {
    throw new OperationalError('Sala de video no encontrada', 404);
  }

  // Buscar invitación pendiente
  const invitation = videoRoom.invitations.find(
    inv => inv.userId.toString() === userId && inv.status === 'pending'
  );

  if (!invitation) {
    throw new OperationalError('No tienes una invitación pendiente para esta sala', 404);
  }

  // Verificar si ya es participante
  const existingParticipant = videoRoom.participants.find(
    p => p.userId.toString() === userId
  );

  if (existingParticipant) {
    throw new OperationalError('Ya eres participante de esta sala', 400);
  }

  // Agregar como participante
  videoRoom.participants.push({
    userId: userId,
    name: `${(req as any).user.firstName} ${(req as any).user.lastName}`,
    role: invitation.role,
    joinedAt: new Date(),
    isActive: true,
    isMuted: false,
    isVideoOff: false
  });

  // Marcar invitación como aceptada
  invitation.status = 'accepted';
  invitation.acceptedAt = new Date();

  await videoRoom.save();

  return sendSuccessResponse(res, { videoRoom }, 'Invitación aceptada exitosamente');
});

// Unirse a sala pública por código
export const joinPublicVideoRoom = asyncErrorHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const userId = (req as any).user.id;

  const videoRoom = await VideoRoom.findOne({ roomId });
  if (!videoRoom) {
    throw new OperationalError('Sala de video no encontrada', 404);
  }

  if (!videoRoom.settings.isPublic) {
    throw new OperationalError('Esta sala no es pública', 403);
  }

  if (!videoRoom.settings.allowGuests) {
    throw new OperationalError('Esta sala no permite invitados', 403);
  }

  // Verificar si ya es participante
  const existingParticipant = videoRoom.participants.find(
    p => p.userId.toString() === userId
  );

  if (existingParticipant) {
    throw new OperationalError('Ya eres participante de esta sala', 400);
  }

  // Verificar límite de participantes
  if (videoRoom.participants.length >= videoRoom.maxParticipants) {
    throw new OperationalError('La sala está llena', 400);
  }

  // Agregar como participante
  videoRoom.participants.push({
    userId: userId,
    name: `${(req as any).user.firstName} ${(req as any).user.lastName}`,
    role: 'guest',
    joinedAt: new Date(),
    isActive: true,
    isMuted: false,
    isVideoOff: false
  });

  await videoRoom.save();

  return sendSuccessResponse(res, { videoRoom }, 'Te has unido a la sala exitosamente');
});

// Actualizar configuración de la sala
export const updateVideoRoomSettings = asyncErrorHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const userId = (req as any).user.id;
  const { name, description, maxParticipants, settings } = req.body;

  const videoRoom = await VideoRoom.findOne({ roomId });

  if (!videoRoom) {
    return sendErrorResponse(res, 'Sala de video no encontrada', 404);
  }

  if (videoRoom.createdBy.toString() !== userId) {
    return sendErrorResponse(res, 'Solo el creador puede actualizar la configuración', 403);
  }

  // Actualizar campos permitidos
  if (name) videoRoom.name = name;
  if (description !== undefined) videoRoom.description = description;
  if (maxParticipants) videoRoom.maxParticipants = maxParticipants;
  if (settings) {
    videoRoom.settings = { ...videoRoom.settings, ...settings };
  }

  await videoRoom.save();

  return sendSuccessResponse(res, {
    videoRoom: {
      ...videoRoom.toJSON(),
      shareLink: (videoRoom as any).getShareLink()
    }
  }, 'Configuración actualizada exitosamente');
});
