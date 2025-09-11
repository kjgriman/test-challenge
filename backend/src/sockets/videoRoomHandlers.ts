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
  // La autenticación se maneja a través del middleware global
  // No crear middleware aquí para evitar conflictos
  console.log('📹 VideoRoomHandlers configurado - usando middleware global');
};
