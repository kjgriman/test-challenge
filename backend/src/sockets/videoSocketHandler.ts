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
    // La autenticación se maneja a través del middleware global
    // No crear middleware aquí para evitar conflictos
    console.log('📹 VideoSocketHandler middleware configurado - usando middleware global');
  }

  private setupEventHandlers() {
    // Los eventos de video se manejarán a través del handler global
    // No crear handler de conexión aquí para evitar conflictos
    console.log('📹 VideoSocketHandler configurado - usando handler global');
  }

  // Método para obtener el servidor Socket.IO
  public getIO(): SocketIOServer {
    return this.io;
  }
}
