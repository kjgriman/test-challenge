import { Server, Socket } from 'socket.io';
import { TherapySession } from '../models/TherapySession';
import { User } from '../models/User';
import * as jwt from 'jsonwebtoken';
import { GameState, GameParticipant } from '../types/gameTypes';

// Usar el mismo JWT_SECRET que el middleware HTTP
const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  sessionId?: string;
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
    console.log('🔍 Autenticando socket con token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    console.log('🔍 JWT_SECRET disponible:', JWT_SECRET ? 'SÍ' : 'NO');
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('✅ Token decodificado:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('❌ Usuario no encontrado en BD:', decoded.userId);
      return false;
    }

    socket.userId = (user._id as any).toString();
    socket.userRole = user.role;
    console.log('✅ Socket autenticado:', { userId: socket.userId, role: socket.userRole });
    return true;
  } catch (error) {
    console.log('❌ Error autenticando socket:', error);
    return false;
  }
};

// Verificar permisos de sesión
const verifySessionAccess = async (socket: AuthenticatedSocket, sessionId: string): Promise<boolean> => {
  try {
    const session = await TherapySession.findById(sessionId);
    if (!session) return false;

    // Verificar que el usuario sea parte de la sesión
    return session.slpId.toString() === socket.userId || 
           session.childId.toString() === socket.userId;
  } catch (error) {
    console.error('Error verificando acceso a sesión:', error);
    return false;
  }
};

// Configurar manejadores de WebSocket
export const setupSocketHandlers = (io: Server) => {
  // Middleware de autenticación global
  io.use(async (socket: AuthenticatedSocket, next) => {
    console.log('🔐 Middleware de autenticación WebSocket ejecutándose');
    
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      console.log('🔑 Token en handshake:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      
      if (!token) {
        console.log('❌ No se proporcionó token');
        return next(new Error('Token no proporcionado'));
      }

      const isAuthenticated = await authenticateSocket(socket, token);
      if (!isAuthenticated) {
        console.log('❌ Falló la autenticación');
        return next(new Error('Token inválido'));
      }

      console.log('✅ Autenticación exitosa, continuando...');
      console.log('🔍 Llamando next()...');
      next();
      console.log('🔍 next() ejecutado');
    } catch (error) {
      console.log('❌ Error en middleware de autenticación:', error);
      next(new Error('Error de autenticación'));
    }
  });

  // Conexión de socket
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log('🎯 HANDLER DE CONEXIÓN EJECUTÁNDOSE');
    console.log('🔌 Socket ID:', socket.id);
    console.log('🔌 Handshake auth:', socket.handshake.auth);

    // Unirse a sesión de juego
    socket.on('joinGameSession', async (data: { sessionId: string; userId: string; userRole: string }) => {
      try {
        const { sessionId, userId, userRole } = data;
        
        if (!sessionId || !userId || !userRole) {
          socket.emit('gameError', 'Datos de sesión de juego requeridos');
          return;
        }

        // Verificar que el userId coincida con el usuario autenticado
        if (socket.userId !== userId) {
          console.log('❌ UserId no coincide:', { socketUserId: socket.userId, requestUserId: userId });
          socket.emit('gameError', 'Token de autenticación inválido');
          return;
        }

        // Unirse a la sala de juego
        const roomName = `game-${sessionId}`;
        await socket.join(roomName);

        console.log(`🎮 Usuario ${userId} se unió a la sala de juego ${sessionId}`);

        // Notificar a otros participantes
        socket.to(roomName).emit('participantJoined', {
          userId,
          name: 'Usuario', // TODO: Obtener nombre real del usuario
          role: userRole,
          isConnected: true,
          score: 0
        });

        // Obtener participantes conectados
        const roomSockets = await io.in(roomName).fetchSockets();
        const participants = roomSockets.map((s: any) => ({
          userId: s.userId,
          name: 'Usuario', // TODO: Obtener nombre real del usuario
          role: s.userRole || 'child',
          isConnected: true,
          score: 0
        }));

        // Enviar estado inicial del juego
        socket.emit('gameStateUpdate', {
          isPlaying: false,
          currentTurn: 'slp',
          score: { slp: 0, child: 0 },
          round: 1,
          maxRounds: 10,
          currentWord: null,
          selectedAnswer: null,
          isCorrect: null,
          timeRemaining: 30,
          isPaused: false,
          participants
        });

        // Confirmar unión
        socket.emit('joinedGameSession', {
          sessionId,
          userId,
          userRole
        });

      } catch (error) {
        console.error('Error uniéndose a sesión de juego:', error);
        socket.emit('gameError', 'Error interno del servidor');
      }
    });

    // Procesar evento de juego
    socket.on('gameEvent', async (data: { sessionId: string; event: any }) => {
      try {
        const { sessionId, event } = data;
        
        if (!sessionId || !event) {
          socket.emit('gameError', 'Datos de evento de juego requeridos');
          return;
        }

        // Verificar que el usuario esté en la sala
        const roomName = `game-${sessionId}`;
        const rooms = Array.from(socket.rooms);
        if (!rooms.includes(roomName)) {
          socket.emit('gameError', 'No estás en esta sesión de juego');
          return;
        }

        // Agregar información del evento
        event.sessionId = sessionId;
        event.timestamp = Date.now();

        console.log(`🎮 Evento de juego recibido: ${event.type} en sesión ${sessionId}`);

        // Manejar eventos específicos del juego
        switch (event.type) {
          case 'gameStart':
            // Inicializar estado del juego
            activeGames.set(sessionId, {
              isPlaying: true,
              currentTurn: 'slp',
              score: { slp: 0, child: 0 },
              round: 1,
              maxRounds: 10,
              currentWord: event.data.currentWord,
              selectedAnswer: null,
              isCorrect: null,
              timeRemaining: 30,
              isPaused: false,
              participants: []
            });
            break;

          case 'answerSelected':
            // Procesar respuesta
            const gameState = activeGames.get(sessionId);
            if (gameState) {
              const isCorrect = event.data.answer === gameState.currentWord?.word;
              gameState.isCorrect = isCorrect;
              gameState.selectedAnswer = event.data.answer;
              
              // Actualizar puntuación
              if (isCorrect) {
                if (gameState.currentTurn === 'slp') {
                  gameState.score.slp += 10;
                } else {
                  gameState.score.child += 10;
                }
              }
              
              // Cambiar turno
              gameState.currentTurn = gameState.currentTurn === 'slp' ? 'child' : 'slp';
              
              // Enviar estado actualizado
              io.to(roomName).emit('gameStateUpdate', gameState);
            }
            break;

          case 'gameEnd':
            // Finalizar juego
            activeGames.delete(sessionId);
            break;
        }

        // Reenviar evento a todos los participantes de la sala
        io.to(roomName).emit('gameEvent', event);

      } catch (error) {
        console.error('Error procesando evento de juego:', error);
        socket.emit('gameError', 'Error interno del servidor');
      }
    });

    // Solicitar estado del juego
    socket.on('requestGameState', async (data: { sessionId: string }) => {
      try {
        const { sessionId } = data;
        
        if (!sessionId) {
          socket.emit('gameError', 'ID de sesión requerido');
          return;
        }

        // Verificar que el usuario esté en la sala
        const roomName = `game-${sessionId}`;
        const rooms = Array.from(socket.rooms);
        if (!rooms.includes(roomName)) {
          socket.emit('gameError', 'No estás en esta sesión de juego');
          return;
        }

        // Obtener participantes conectados
        const roomSockets = await io.in(roomName).fetchSockets();
        const participants = roomSockets.map((s: any) => ({
          userId: s.userId,
          name: 'Usuario', // TODO: Obtener nombre real del usuario
          role: s.userRole || 'child',
          isConnected: true,
          score: 0
        }));

        // Enviar estado actual
        socket.emit('gameStateUpdate', {
          isPlaying: false,
          currentTurn: 'slp',
          score: { slp: 0, child: 0 },
          round: 1,
          maxRounds: 10,
          currentWord: null,
          selectedAnswer: null,
          isCorrect: null,
          timeRemaining: 30,
          isPaused: false,
          participants
        });

      } catch (error) {
        console.error('Error obteniendo estado del juego:', error);
        socket.emit('gameError', 'Error interno del servidor');
      }
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`🔌 Usuario desconectado: ${socket.userId}, razón: ${socket.disconnected ? 'desconectado' : 'desconectado por servidor'}`);
      
      // Limpiar conexiones de sesión
      for (const [sessionId, connections] of Array.from(sessionConnections.entries())) {
        connections.delete(socket.id);
        if (connections.size === 0) {
          sessionConnections.delete(sessionId);
        }
      }
    });
  });

  console.log('🔌 WebSocket handlers configurados');
};