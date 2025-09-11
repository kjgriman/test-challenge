import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { GameEvent, GameState, GameParticipant } from '../types/gameTypes';

// Usar el mismo JWT_SECRET que el middleware HTTP
const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';

// Almacenamiento temporal de conexiones de juego
const gameConnections = new Map<string, Map<string, Socket>>();

export class GameSocketHandler {
  private io: any;

  constructor(io: any) {
    this.io = io;
    this.setupGameHandlers();
  }

  private setupGameHandlers() {
    // No crear handler de conexión aquí - usar el middleware global
    // Los eventos de juego se manejarán a través del middleware global
    console.log('🎮 GameSocketHandler configurado - usando middleware global');
  }

  // Método para obtener estadísticas de conexiones
  getConnectionStats() {
    const stats = {
      totalSessions: gameConnections.size,
      totalConnections: 0,
      sessions: [] as any[]
    };

    for (const [sessionId, connections] of Array.from(gameConnections.entries())) {
      stats.totalConnections += connections.size;
      stats.sessions.push({
        sessionId,
        participantCount: connections.size,
        participants: Array.from(connections.keys())
      });
    }

    return stats;
  }

  // Método para limpiar conexiones inactivas
  cleanupInactiveConnections() {
    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutos

    for (const [sessionId, connections] of Array.from(gameConnections.entries())) {
      const activeConnections = new Map();
      
      for (const [userId, socket] of Array.from(connections.entries())) {
        if (socket.connected) {
          activeConnections.set(userId, socket);
        }
      }

      if (activeConnections.size === 0) {
        gameConnections.delete(sessionId);
        console.log(`🧹 Sesión de juego ${sessionId} eliminada - sin conexiones activas`);
      } else {
        gameConnections.set(sessionId, activeConnections);
      }
    }
  }
}

export default GameSocketHandler;
