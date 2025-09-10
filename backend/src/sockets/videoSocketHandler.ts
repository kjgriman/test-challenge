import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { TherapySession } from '../models/TherapySession';
import { User } from '../models/User';
import * as jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  userName?: string;
}

interface VideoSignal {
  sessionId: string;
  signal: any;
  targetUserId: string;
}

interface VideoParticipantUpdate {
  sessionId: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

export class VideoSocketHandler {
  private io: SocketIOServer;
  private sessionRooms: Map<string, Set<string>> = new Map(); // sessionId -> Set of socketIds

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Autenticación de WebSocket
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Token no proporcionado'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
        const user = await User.findById(decoded.userId);
        
        if (!user) {
          return next(new Error('Usuario no encontrado'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.userName = `${user.firstName} ${user.lastName}`;
        
        next();
      } catch (error) {
        next(new Error('Token inválido'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`🔌 Usuario conectado: ${socket.userName} (${socket.userId})`);

      // Unirse a una sala de video de sesión
      socket.on('join-video-session', async (sessionId: string) => {
        try {
          const session = await TherapySession.findById(sessionId);
          if (!session) {
            socket.emit('error', 'Sesión no encontrada');
            return;
          }

          // Verificar que el usuario es parte de la sesión
          if (session.slpId.toString() !== socket.userId && 
              session.childId.toString() !== socket.userId) {
            socket.emit('error', 'No tienes permisos para esta sesión');
            return;
          }

          // Unirse a la sala
          socket.join(`session-${sessionId}`);
          
          // Agregar a la sala local
          if (!this.sessionRooms.has(sessionId)) {
            this.sessionRooms.set(sessionId, new Set());
          }
          this.sessionRooms.get(sessionId)!.add(socket.id);

          // Agregar como participante en la base de datos
          await session.addVideoParticipant(
            socket.userId as any,
            socket.userName!,
            socket.userRole as 'slp' | 'child'
          );

          // Notificar a otros participantes
          socket.to(`session-${sessionId}`).emit('participant-joined', {
            userId: socket.userId,
            name: socket.userName,
            role: socket.userRole
          });

          // Enviar lista de participantes actuales
          const participants = session.getActiveVideoParticipants();
          socket.emit('video-participants', participants);

          console.log(`🎥 Usuario ${socket.userName} se unió al video de sesión ${sessionId}`);
        } catch (error) {
          console.error('Error al unirse al video:', error);
          socket.emit('error', 'Error al unirse al video');
        }
      });

      // Señales WebRTC
      socket.on('video-signal', (data: VideoSignal) => {
        socket.to(`session-${data.sessionId}`).emit('video-signal', {
          signal: data.signal,
          fromUserId: socket.userId
        });
      });

      // Actualizar estado del participante (mute, video off)
      socket.on('participant-update', async (data: VideoParticipantUpdate) => {
        try {
          const session = await TherapySession.findById(data.sessionId);
          if (!session) return;

          const participant = session.videoParticipants.find(
            p => p.userId.toString() === socket.userId
          );

          if (participant) {
            if (data.isMuted !== undefined) {
              participant.isMuted = data.isMuted;
            }
            if (data.isVideoOff !== undefined) {
              participant.isVideoOff = data.isVideoOff;
            }
            await session.save();

            // Notificar a otros participantes
            socket.to(`session-${data.sessionId}`).emit('participant-updated', {
              userId: socket.userId,
              isMuted: participant.isMuted,
              isVideoOff: participant.isVideoOff
            });
          }
        } catch (error) {
          console.error('Error al actualizar participante:', error);
        }
      });

      // Salir del video
      socket.on('leave-video-session', async (sessionId: string) => {
        try {
          const session = await TherapySession.findById(sessionId);
          if (session) {
            await session.removeVideoParticipant(socket.userId as any);
          }

          socket.leave(`session-${sessionId}`);
          
          // Remover de la sala local
          const room = this.sessionRooms.get(sessionId);
          if (room) {
            room.delete(socket.id);
            if (room.size === 0) {
              this.sessionRooms.delete(sessionId);
            }
          }

          // Notificar a otros participantes
          socket.to(`session-${sessionId}`).emit('participant-left', {
            userId: socket.userId,
            name: socket.userName
          });

          console.log(`🎥 Usuario ${socket.userName} salió del video de sesión ${sessionId}`);
        } catch (error) {
          console.error('Error al salir del video:', error);
        }
      });

      // Desconexión
      socket.on('disconnect', async () => {
        console.log(`🔌 Usuario desconectado: ${socket.userName} (${socket.userId})`);
        
        // Remover de todas las salas
        for (const [sessionId, room] of Array.from(this.sessionRooms.entries())) {
          if (room.has(socket.id)) {
            try {
              const session = await TherapySession.findById(sessionId);
              if (session) {
                await session.removeVideoParticipant(socket.userId as any);
              }
              
              room.delete(socket.id);
              if (room.size === 0) {
                this.sessionRooms.delete(sessionId);
              }

              socket.to(`session-${sessionId}`).emit('participant-left', {
                userId: socket.userId,
                name: socket.userName
              });
            } catch (error) {
              console.error('Error al limpiar desconexión:', error);
            }
          }
        }
      });
    });
  }

  // Método para obtener el servidor Socket.IO
  public getIO(): SocketIOServer {
    return this.io;
  }
}
