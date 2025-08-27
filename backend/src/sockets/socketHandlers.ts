import { Server, Socket } from 'socket.io';
import { TherapySession } from '../models/TherapySession';
import { User } from '../models/User';
import * as jwt from 'jsonwebtoken';
import { setupVideoRoomHandlers } from './videoRoomHandlers';
import GameHandlers from './gameHandlers';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  sessionId?: string;
}

interface GameState {
  sessionId: string;
  gameType: string;
  currentLevel: number;
  score: number;
  accuracy: number;
  timeRemaining: number;
  isActive: boolean;
}

interface GameAction {
  type: string;
  data: any;
  timestamp: number;
}

// Almacenar estados de juegos activos
const activeGames = new Map<string, GameState>();

// Almacenar conexiones de usuarios por sesión
const sessionConnections = new Map<string, Set<string>>();

// Autenticar socket
const authenticateSocket = async (socket: AuthenticatedSocket, token: string): Promise<boolean> => {
  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'your-secret-key') as any;
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return false;
    }

    socket.userId = (user._id as any).toString();
    socket.userRole = user.role;
    return true;
  } catch (error) {
    return false;
  }
};

// Verificar permisos de sesión
const verifySessionAccess = async (socket: AuthenticatedSocket, sessionId: string): Promise<boolean> => {
  try {
    const session = await TherapySession.findById(sessionId);
    if (!session) return false;

    if (socket.userRole === 'slp') {
      return session.slpId.toString() === socket.userId;
    } else {
      return session.childId.toString() === socket.userId;
    }
  } catch (error) {
    return false;
  }
};

// Configurar manejadores de WebSocket
export const setupSocketHandlers = (io: Server) => {
  // Configurar handlers de salas de video
  setupVideoRoomHandlers(io);
  
  // Configurar handlers de juegos
  const gameHandlers = new GameHandlers(io);
  gameHandlers.initialize();
  // Middleware de autenticación
  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth['token'];
    
    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    const isAuthenticated = await authenticateSocket(socket, token);
    if (!isAuthenticated) {
      return next(new Error('Token inválido'));
    }

    next();
  });

  // Conexión de socket
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🔌 Usuario conectado: ${socket.userId} (${socket.userRole})`);

    // Unirse a sesión
    socket.on('join-session', async (sessionId: string) => {
      try {
        const hasAccess = await verifySessionAccess(socket, sessionId);
        if (!hasAccess) {
          socket.emit('error', { message: 'No tienes permisos para esta sesión' });
          return;
        }

        // Unirse al room de la sesión
        socket.join(`session:${sessionId}`);
        socket.sessionId = sessionId;

        // Registrar conexión
        if (!sessionConnections.has(sessionId)) {
          sessionConnections.set(sessionId, new Set());
        }
        sessionConnections.get(sessionId)!.add(socket.userId!);

        // Notificar a otros participantes
        socket.to(`session:${sessionId}`).emit('user-joined', {
          userId: socket.userId,
          userRole: socket.userRole,
          timestamp: new Date().toISOString()
        });

        // Enviar estado actual del juego si existe
        const gameState = activeGames.get(sessionId);
        if (gameState) {
          socket.emit('game-state', gameState);
        }

        console.log(`👥 Usuario ${socket.userId} se unió a la sesión ${sessionId}`);

      } catch (error) {
        socket.emit('error', { message: 'Error al unirse a la sesión' });
      }
    });

    // Salir de sesión
    socket.on('leave-session', (sessionId: string) => {
      socket.leave(`session:${sessionId}`);
      
      // Remover de conexiones
      const connections = sessionConnections.get(sessionId);
      if (connections) {
        connections.delete(socket.userId!);
        if (connections.size === 0) {
          sessionConnections.delete(sessionId);
        }
      }

      // Notificar a otros participantes
      socket.to(`session:${sessionId}`).emit('user-left', {
        userId: socket.userId,
        userRole: socket.userRole,
        timestamp: new Date().toISOString()
      });

      console.log(`👋 Usuario ${socket.userId} salió de la sesión ${sessionId}`);
    });

    // Iniciar juego
    socket.on('start-game', async (data: { sessionId: string; gameType: string; level: number }) => {
      try {
        const hasAccess = await verifySessionAccess(socket, data.sessionId);
        if (!hasAccess || socket.userRole !== 'slp') {
          socket.emit('error', { message: 'No tienes permisos para iniciar el juego' });
          return;
        }

        const gameState: GameState = {
          sessionId: data.sessionId,
          gameType: data.gameType,
          currentLevel: data.level,
          score: 0,
          accuracy: 0,
          timeRemaining: 300, // 5 minutos
          isActive: true
        };

        activeGames.set(data.sessionId, gameState);

        // Notificar a todos los participantes
        io.to(`session:${data.sessionId}`).emit('game-started', gameState);

        console.log(`🎮 Juego iniciado en sesión ${data.sessionId}: ${data.gameType}`);

      } catch (error) {
        socket.emit('error', { message: 'Error al iniciar el juego' });
      }
    });

    // Acción de juego
    socket.on('game-action', (action: GameAction) => {
      const gameState = activeGames.get(socket.sessionId!);
      if (!gameState || !gameState.isActive) {
        socket.emit('error', { message: 'No hay juego activo' });
        return;
      }

      // Procesar acción según el tipo
      switch (action.type) {
        case 'correct-answer':
          gameState.score += 10;
          gameState.accuracy = ((gameState.accuracy * 0.9) + 100) / 2;
          break;
        case 'incorrect-answer':
          gameState.accuracy = ((gameState.accuracy * 0.9) + 0) / 2;
          break;
        case 'level-complete':
          gameState.currentLevel++;
          gameState.score += 50;
          break;
        case 'time-update':
          gameState.timeRemaining = action.data.timeRemaining;
          break;
      }

      // Sincronizar con todos los participantes
      io.to(`session:${socket.sessionId}`).emit('game-update', {
        action,
        gameState,
        timestamp: new Date().toISOString()
      });

      console.log(`🎯 Acción de juego: ${action.type} en sesión ${socket.sessionId}`);
    });

    // Finalizar juego
    socket.on('end-game', async (data: { sessionId: string; finalScore: number; finalAccuracy: number }) => {
      try {
        const hasAccess = await verifySessionAccess(socket, data.sessionId);
        if (!hasAccess || socket.userRole !== 'slp') {
          socket.emit('error', { message: 'No tienes permisos para finalizar el juego' });
          return;
        }

        const gameState = activeGames.get(data.sessionId);
        if (gameState) {
          gameState.isActive = false;
          gameState.score = data.finalScore;
          gameState.accuracy = data.finalAccuracy;

          // Actualizar sesión en la base de datos
          await TherapySession.findByIdAndUpdate(data.sessionId, {
            $inc: { 
              gamesPlayed: 1,
              totalScore: data.finalScore
            },
            $set: { 
              lastGameAccuracy: data.finalAccuracy,
              lastGameDate: new Date()
            }
          });

          // Notificar a todos los participantes
          io.to(`session:${data.sessionId}`).emit('game-ended', {
            finalScore: data.finalScore,
            finalAccuracy: data.finalAccuracy,
            timestamp: new Date().toISOString()
          });

          // Limpiar estado del juego después de un tiempo
          setTimeout(() => {
            activeGames.delete(data.sessionId);
          }, 60000); // 1 minuto

          console.log(`🏁 Juego finalizado en sesión ${data.sessionId}`);
        }

      } catch (error) {
        socket.emit('error', { message: 'Error al finalizar el juego' });
      }
    });

    // Chat en tiempo real
    socket.on('chat-message', (data: { sessionId: string; message: string; type: 'text' | 'system' }) => {
      const message = {
        userId: socket.userId,
        userRole: socket.userRole,
        message: data.message,
        type: data.type,
        timestamp: new Date().toISOString()
      };

      // Enviar a todos los participantes de la sesión
      io.to(`session:${data.sessionId}`).emit('chat-message', message);

      console.log(`💬 Mensaje de chat en sesión ${data.sessionId}: ${data.message}`);
    });

    // Notificaciones de estado de sesión
    socket.on('session-status', (data: { sessionId: string; status: string; notes?: string }) => {
      if (socket.userRole !== 'slp') {
        socket.emit('error', { message: 'Solo los SLP pueden cambiar el estado de la sesión' });
        return;
      }

      const statusUpdate = {
        status: data.status,
        notes: data.notes,
        updatedBy: socket.userId,
        timestamp: new Date().toISOString()
      };

      // Enviar a todos los participantes
      io.to(`session:${data.sessionId}`).emit('session-status-update', statusUpdate);

      console.log(`📊 Estado de sesión actualizado: ${data.status} en sesión ${data.sessionId}`);
    });

    // Ping para mantener conexión
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`🔌 Usuario desconectado: ${socket.userId}`);

      // Limpiar conexiones si el usuario estaba en una sesión
      if (socket.sessionId) {
        const connections = sessionConnections.get(socket.sessionId);
        if (connections) {
          connections.delete(socket.userId!);
          if (connections.size === 0) {
            sessionConnections.delete(socket.sessionId);
          }
        }

        // Notificar a otros participantes
        socket.to(`session:${socket.sessionId}`).emit('user-disconnected', {
          userId: socket.userId,
          userRole: socket.userRole,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  // Función para obtener estadísticas de conexiones
  const getConnectionStats = () => {
    return {
      totalConnections: io.engine.clientsCount,
      activeSessions: sessionConnections.size,
      activeGames: activeGames.size,
      sessionConnections: Object.fromEntries(
        Array.from(sessionConnections.entries()).map(([sessionId, connections]) => [
          sessionId,
          connections.size
        ])
      )
    };
  };

  // Endpoint para obtener estadísticas (solo para desarrollo)
  if (process.env['NODE_ENV'] === 'development') {
    io.on('get-stats', () => {
      io.emit('connection-stats', getConnectionStats());
    });
  }

  console.log('🔌 WebSocket handlers configurados');
};
