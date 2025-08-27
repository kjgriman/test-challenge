import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import { VideoRoom } from '../models/VideoRoom';

interface VideoRoomSocket extends Socket {
  roomId?: string;
  userId?: string;
  userRole?: string;
}

interface Participant {
  userId: string;
  name: string;
  role: 'slp' | 'child';
  isActive: boolean;
  joinedAt: Date;
}

export const setupVideoRoomHandlers = (io: Server) => {
  const videoRooms = new Map<string, Set<VideoRoomSocket>>();

  io.on('connection', (socket: VideoRoomSocket) => {
    console.log('🔌 Cliente conectado:', socket.id);

    // Unirse a una sala de video
    socket.on('join_video_room', async (data: {
      roomId: string;
      userId: string;
      name: string;
      role: 'slp' | 'child';
    }) => {
      try {
        const { roomId, userId, name, role } = data;
        
        // Verificar que la sala existe
        const room = await VideoRoom.findOne({ roomId });
        if (!room) {
          socket.emit('error', { message: 'Sala no encontrada' });
          return;
        }

        // Unirse al socket room
        socket.join(roomId);
        socket.roomId = roomId;
        socket.userId = userId;
        socket.userRole = role;

        // Agregar a la lista de participantes
        if (!videoRooms.has(roomId)) {
          videoRooms.set(roomId, new Set());
        }
        videoRooms.get(roomId)!.add(socket);

        // Agregar participante a la base de datos
        await room.addParticipant(new mongoose.Types.ObjectId(userId), name, role);

        // Notificar a todos en la sala
        const participants = await room.getActiveParticipants();
        io.to(roomId).emit('participant_joined', {
          participant: {
            userId,
            name,
            role,
            isActive: true,
            joinedAt: new Date()
          }
        });

        // Enviar información de la sala al nuevo participante
        socket.emit('room_info', {
          title: room.title,
          participants: participants.map(p => ({
            userId: p.userId,
            name: p.name,
            role: p.role,
            isActive: p.isActive,
            joinedAt: p.joinedAt
          }))
        });

        console.log(`👤 ${name} se unió a la sala ${roomId}`);

      } catch (error) {
        console.error('Error uniéndose a sala:', error);
        socket.emit('error', { message: 'Error al unirse a la sala' });
      }
    });

    // Salir de una sala de video
    socket.on('leave_video_room', async () => {
      try {
        const { roomId, userId } = socket;
        if (!roomId || !userId) return;

        // Remover de la lista de participantes
        const roomParticipants = videoRooms.get(roomId);
        if (roomParticipants) {
          roomParticipants.delete(socket);
          if (roomParticipants.size === 0) {
            videoRooms.delete(roomId);
          }
        }

        // Remover participante de la base de datos
        const room = await VideoRoom.findOne({ roomId });
        if (room) {
          await room.removeParticipant(new mongoose.Types.ObjectId(userId));
        }

        // Notificar a otros participantes
        socket.to(roomId).emit('participant_left', { userId });

        // Salir del socket room
        socket.leave(roomId);
        socket.roomId = undefined;
        socket.userId = undefined;
        socket.userRole = undefined;

        console.log(`👤 Usuario ${userId} salió de la sala ${roomId}`);

      } catch (error) {
        console.error('Error saliendo de sala:', error);
      }
    });

    // Toggle mute
    socket.on('toggle_mute', async (data: { userId: string; isMuted: boolean }) => {
      const { roomId } = socket;
      if (!roomId) return;

      socket.to(roomId).emit('participant_updated', {
        userId: data.userId,
        updates: { isMuted: data.isMuted }
      });
    });

    // Toggle video
    socket.on('toggle_video', async (data: { userId: string; isVideoOff: boolean }) => {
      const { roomId } = socket;
      if (!roomId) return;

      socket.to(roomId).emit('participant_updated', {
        userId: data.userId,
        updates: { isVideoOff: data.isVideoOff }
      });
    });

    // Desconexión
    socket.on('disconnect', async () => {
      try {
        const { roomId, userId } = socket;
        if (roomId && userId) {
          // Remover de la lista de participantes
          const roomParticipants = videoRooms.get(roomId);
          if (roomParticipants) {
            roomParticipants.delete(socket);
            if (roomParticipants.size === 0) {
              videoRooms.delete(roomId);
            }
          }

          // Remover participante de la base de datos
          const room = await VideoRoom.findOne({ roomId });
          if (room) {
            await room.removeParticipant(new mongoose.Types.ObjectId(userId));
          }

          // Notificar a otros participantes
          socket.to(roomId).emit('participant_left', { userId });
        }

        console.log('🔌 Cliente desconectado:', socket.id);
      } catch (error) {
        console.error('Error en desconexión:', error);
      }
    });
  });

  return videoRooms;
};
