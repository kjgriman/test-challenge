import { Server, Socket } from 'socket.io';
import { authenticate } from '../middleware/auth';

// Almacenar información de salas en memoria
const videoRooms = new Map<string, {
  id: string;
  name: string;
  participants: Set<string>;
  createdAt: Date;
}>();

export const setupVideoRoomHandlers = (io: Server) => {
  // Middleware de autenticación
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Token no proporcionado'));
      }

      // Verificar token JWT
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // Agregar información del usuario al socket
      (socket as any).userId = decoded.userId;
      (socket as any).userEmail = decoded.email;
      
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Usuario conectado: ${(socket as any).userEmail}`);

    // Crear una nueva sala de video
    socket.on('create-video-room', async (data: { roomName: string }) => {
      try {
        const { roomName } = data;
        const userId = (socket as any).userId;
        const userEmail = (socket as any).userEmail;

        if (!userId) {
          socket.emit('error', { message: 'Usuario no autenticado' });
          return;
        }

        // Generar ID único para la sala
        const roomId = Math.random().toString(36).substring(2, 15);
        
        // Crear sala
        videoRooms.set(roomId, {
          id: roomId,
          name: roomName,
          participants: new Set([userId]),
          createdAt: new Date()
        });

        // Unirse a la sala
        await socket.join(roomId);
        
        console.log(`🏠 Sala creada: ${roomName} (${roomId}) por ${userEmail}`);

        // Confirmar creación
        socket.emit('room-created', { 
          roomId, 
          roomName,
          participants: [userId]
        });

        // Notificar a otros usuarios sobre la nueva sala
        socket.broadcast.emit('room-created', {
          roomId,
          roomName,
          createdBy: userEmail
        });

      } catch (error) {
        console.error('Error creando sala:', error);
        socket.emit('error', { message: 'Error creando la sala' });
      }
    });

    // Unirse a una sala de video existente
    socket.on('join-video-room', async (data: { roomId: string }) => {
      try {
        const { roomId } = data;
        const userId = (socket as any).userId;
        const userEmail = (socket as any).userEmail;

        if (!userId) {
          socket.emit('error', { message: 'Usuario no autenticado' });
          return;
        }

        // Verificar si la sala existe
        const room = videoRooms.get(roomId);
        if (!room) {
          socket.emit('error', { message: 'Sala no encontrada' });
          return;
        }

        // Agregar usuario a la sala
        room.participants.add(userId);
        
        // Unirse a la sala
        await socket.join(roomId);
        
        console.log(`👤 Usuario ${userEmail} se unió a la sala ${room.name} (${roomId})`);

        // Notificar a otros usuarios en la sala
        socket.to(roomId).emit('user-joined', {
          userId,
          userEmail,
          roomId
        });

        // Confirmar unión y enviar lista de participantes
        socket.emit('joined-room', { 
          roomId,
          roomName: room.name,
          participants: Array.from(room.participants)
        });

      } catch (error) {
        console.error('Error uniéndose a sala:', error);
        socket.emit('error', { message: 'Error uniéndose a la sala' });
      }
    });

    // Salir de una sala de video
    socket.on('leave-video-room', async (data: { roomId: string }) => {
      try {
        const { roomId } = data;
        const userId = (socket as any).userId;
        const userEmail = (socket as any).userEmail;

        if (!userId) return;

        const room = videoRooms.get(roomId);
        if (room) {
          room.participants.delete(userId);
          
          // Si no hay participantes, eliminar la sala
          if (room.participants.size === 0) {
            videoRooms.delete(roomId);
            console.log(`🗑️ Sala ${room.name} eliminada (sin participantes)`);
          }
        }

        // Salir de la sala
        await socket.leave(roomId);
        
        console.log(`👤 Usuario ${userEmail} salió de la sala ${roomId}`);

        // Notificar a otros usuarios en la sala
        socket.to(roomId).emit('user-left', {
          userId,
          userEmail,
          roomId
        });

      } catch (error) {
        console.error('Error saliendo de sala:', error);
      }
    });

    // Obtener lista de salas disponibles
    socket.on('get-video-rooms', () => {
      try {
        const rooms = Array.from(videoRooms.values()).map(room => ({
          id: room.id,
          name: room.name,
          participantCount: room.participants.size,
          createdAt: room.createdAt
        }));

        socket.emit('video-rooms-list', { rooms });
      } catch (error) {
        console.error('Error obteniendo salas:', error);
        socket.emit('error', { message: 'Error obteniendo salas' });
      }
    });

    // WebRTC Signaling - Oferta
    socket.on('webrtc-offer', (data: { roomId: string; offer: RTCSessionDescriptionInit }) => {
      try {
        const { roomId, offer } = data;
        const userId = (socket as any).userId;

        console.log(`📡 Oferta WebRTC de ${userId} en sala ${roomId}`);
        
        // Reenviar oferta a otros usuarios en la sala
        socket.to(roomId).emit('webrtc-offer', {
          offer,
          fromUserId: userId
        });

      } catch (error) {
        console.error('Error enviando oferta WebRTC:', error);
      }
    });

    // WebRTC Signaling - Respuesta
    socket.on('webrtc-answer', (data: { roomId: string; answer: RTCSessionDescriptionInit }) => {
      try {
        const { roomId, answer } = data;
        const userId = (socket as any).userId;

        console.log(`📡 Respuesta WebRTC de ${userId} en sala ${roomId}`);
        
        // Reenviar respuesta a otros usuarios en la sala
        socket.to(roomId).emit('webrtc-answer', {
          answer,
          fromUserId: userId
        });

      } catch (error) {
        console.error('Error enviando respuesta WebRTC:', error);
      }
    });

    // WebRTC Signaling - ICE Candidate
    socket.on('webrtc-ice-candidate', (data: { roomId: string; candidate: RTCIceCandidateInit }) => {
      try {
        const { roomId, candidate } = data;
        const userId = (socket as any).userId;

        console.log(`🧊 ICE Candidate de ${userId} en sala ${roomId}`);
        
        // Reenviar ICE candidate a otros usuarios en la sala
        socket.to(roomId).emit('webrtc-ice-candidate', {
          candidate,
          fromUserId: userId
        });

      } catch (error) {
        console.error('Error enviando ICE candidate:', error);
      }
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log(`🔌 Usuario desconectado: ${(socket as any).userEmail}`);
      
      // Remover usuario de todas las salas
      videoRooms.forEach((room, roomId) => {
        if (room.participants.has((socket as any).userId)) {
          room.participants.delete((socket as any).userId);
          
          if (room.participants.size === 0) {
            videoRooms.delete(roomId);
            console.log(`🗑️ Sala ${room.name} eliminada (usuario desconectado)`);
          }
        }
      });
    });
  });
};
