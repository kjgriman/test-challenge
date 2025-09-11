import { Request, Response } from 'express';
import { OperationalError } from '../middleware/errorHandler';

// Tipos temporales para evitar problemas de importación
interface GameState {
  isPlaying: boolean;
  currentTurn: 'slp' | 'child';
  score: { slp: number; child: number };
  round: number;
  maxRounds: number;
  currentWord: any;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  timeRemaining: number;
  isPaused: boolean;
  participants: GameParticipant[];
}

interface GameParticipant {
  userId: string;
  name: string;
  role: 'slp' | 'child';
  isConnected: boolean;
  score: number;
}

interface GameResults {
  score: { slp: number; child: number };
  totalRounds: number;
  correctAnswers: { slp: number; child: number };
  winner: 'slp' | 'child' | 'tie';
  duration: number;
  participants: GameParticipant[];
}

interface GameEvent {
  type: string;
  data: any;
  timestamp: number;
  userId: string;
  sessionId?: string;
}

// Almacenamiento temporal de sesiones de juego (en producción usar Redis)
const gameSessions = new Map<string, {
  gameState: GameState;
  participants: Map<string, GameParticipant>;
  events: GameEvent[];
  createdAt: Date;
  lastActivity: Date;
}>();

// Limpiar sesiones inactivas cada 5 minutos
setInterval(() => {
  const now = new Date();
  const inactiveThreshold = 30 * 60 * 1000; // 30 minutos

  for (const [sessionId, session] of Array.from(gameSessions.entries())) {
    if (now.getTime() - session.lastActivity.getTime() > inactiveThreshold) {
      gameSessions.delete(sessionId);
      console.log(`🧹 Sesión de juego ${sessionId} eliminada por inactividad`);
    }
  }
}, 5 * 60 * 1000);

export const gameController = {
  // Unirse a una sesión de juego
  joinGameSession: async (req: Request, res: Response) => {
    try {
      const { sessionId, userId, userRole } = req.body;
      const user = req.user;

      if (!sessionId || !userId || !userRole) {
        throw new OperationalError('Datos de sesión de juego requeridos', 400);
      }

      // Crear o obtener sesión de juego
      if (!gameSessions.has(sessionId)) {
        const initialGameState: GameState = {
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
          participants: []
        };

        gameSessions.set(sessionId, {
          gameState: initialGameState,
          participants: new Map(),
          events: [],
          createdAt: new Date(),
          lastActivity: new Date()
        });
      }

      const session = gameSessions.get(sessionId)!;
      
      // Crear participante
      const participant: GameParticipant = {
        userId,
        name: user ? `${user.firstName} ${user.lastName}` : 'Usuario',
        role: userRole as 'slp' | 'child',
        isConnected: true,
        score: 0
      };

      // Agregar o actualizar participante
      session.participants.set(userId, participant);
      session.lastActivity = new Date();

      // Actualizar estado del juego
      session.gameState.participants = Array.from(session.participants.values());

      // Crear evento
      const event: GameEvent = {
        type: 'participantJoined',
        data: participant,
        timestamp: Date.now(),
        userId
      };

      session.events.push(event);

      // Emitir evento a todos los participantes
      req.app.get('io').to(`game-${sessionId}`).emit('participantJoined', participant);
      req.app.get('io').to(`game-${sessionId}`).emit('gameStateUpdate', session.gameState);

      res.json({
        success: true,
        message: 'Unido a la sesión de juego',
        gameState: session.gameState,
        participant
      });

    } catch (error) {
      console.error('Error uniéndose a sesión de juego:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // Procesar evento de juego
  processGameEvent: async (req: Request, res: Response) => {
    try {
      const { sessionId, event } = req.body;
      const userId = req.user?.id;

      if (!sessionId || !event || !userId) {
        throw new OperationalError('Datos de evento de juego requeridos', 400);
      }

      const session = gameSessions.get(sessionId);
      if (!session) {
        throw new OperationalError('Sesión de juego no encontrada', 404);
      }

      // Verificar que el usuario esté en la sesión
      if (!session.participants.has(userId)) {
        throw new OperationalError('Usuario no autorizado para esta sesión', 403);
      }

      // Procesar evento según el tipo
      await processGameEventType(session, event, userId, req.app.get('io'));

      res.json({
        success: true,
        message: 'Evento procesado correctamente'
      });

    } catch (error) {
      console.error('Error procesando evento de juego:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // Obtener estado del juego
  getGameState: async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id;

      if (!sessionId || !userId) {
        throw new OperationalError('ID de sesión y usuario requeridos', 400);
      }

      const session = gameSessions.get(sessionId);
      if (!session) {
        throw new OperationalError('Sesión de juego no encontrada', 404);
      }

      // Verificar que el usuario esté en la sesión
      if (!session.participants.has(userId)) {
        throw new OperationalError('Usuario no autorizado para esta sesión', 403);
      }

      res.json({
        success: true,
        gameState: session.gameState,
        participants: Array.from(session.participants.values())
      });

    } catch (error) {
      console.error('Error obteniendo estado del juego:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // Salir de la sesión de juego
  leaveGameSession: async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id;

      if (!sessionId || !userId) {
        throw new OperationalError('ID de sesión y usuario requeridos', 400);
      }

      const session = gameSessions.get(sessionId);
      if (!session) {
        throw new OperationalError('Sesión de juego no encontrada', 404);
      }

      // Remover participante
      const participant = session.participants.get(userId);
      if (participant) {
        session.participants.delete(userId);
        session.lastActivity = new Date();

        // Actualizar estado del juego
        session.gameState.participants = Array.from(session.participants.values());

        // Crear evento
        const event: GameEvent = {
          type: 'participantLeft',
          data: { userId },
          timestamp: Date.now(),
          userId
        };

        session.events.push(event);

        // Emitir evento a todos los participantes
        req.app.get('io').to(`game-${sessionId}`).emit('participantLeft', userId);
        req.app.get('io').to(`game-${sessionId}`).emit('gameStateUpdate', session.gameState);

        // Si no hay participantes, eliminar sesión
        if (session.participants.size === 0) {
          gameSessions.delete(sessionId);
          console.log(`🧹 Sesión de juego ${sessionId} eliminada - sin participantes`);
        }
      }

      res.json({
        success: true,
        message: 'Salido de la sesión de juego'
      });

    } catch (error) {
      console.error('Error saliendo de sesión de juego:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }
};

// Función para procesar diferentes tipos de eventos de juego
async function processGameEventType(
  session: any,
  event: GameEvent,
  userId: string,
  io: any
): Promise<void> {
  const { sessionId } = event;
  
  switch (event.type) {
    case 'gameStart':
      session.gameState.isPlaying = true;
      session.gameState.currentWord = event.data.currentWord;
      session.gameState.round = 1;
      session.gameState.score = { slp: 0, child: 0 };
      session.gameState.timeRemaining = 30;
      session.gameState.isPaused = false;
      break;

    case 'gameEnd':
      session.gameState.isPlaying = false;
      const results: GameResults = {
        ...event.data,
        participants: Array.from(session.participants.values())
      };
      break;

    case 'roundStart':
      session.gameState.currentWord = event.data.currentWord;
      session.gameState.round = event.data.round;
      session.gameState.timeRemaining = 30;
      session.gameState.selectedAnswer = null;
      session.gameState.isCorrect = null;
      break;

    case 'answerSelected':
      session.gameState.selectedAnswer = event.data.answer;
      session.gameState.isCorrect = event.data.isCorrect;
      
      // Actualizar puntuación
      if (event.data.isCorrect) {
        const participant = session.participants.get(userId);
        if (participant) {
          participant.score += 10;
          session.gameState.score[participant.role] += 10;
        }
      }
      break;

    case 'turnChange':
      session.gameState.currentTurn = event.data.newTurn;
      session.gameState.timeRemaining = 30;
      break;

    case 'timeUp':
      session.gameState.timeRemaining = 0;
      // Cambiar turno automáticamente
      session.gameState.currentTurn = session.gameState.currentTurn === 'slp' ? 'child' : 'slp';
      break;

    case 'pause':
      session.gameState.isPaused = true;
      break;

    case 'resume':
      session.gameState.isPaused = false;
      break;
  }

  // Actualizar última actividad
  session.lastActivity = new Date();
  
  // Agregar evento al historial
  session.events.push(event);

  // Emitir evento a todos los participantes
  io.to(`game-${sessionId}`).emit('gameEvent', event);
  io.to(`game-${sessionId}`).emit('gameStateUpdate', session.gameState);
}

// Obtener lista de juegos disponibles
export const getGames = async (req: Request, res: Response) => {
  try {
    console.log('🎮 Endpoint /api/games llamado');
    // Datos de ejemplo de juegos disponibles
    const games = [
      {
        _id: '1',
        name: 'Adivina la Palabra',
        description: 'Juego de vocabulario donde debes adivinar palabras basándote en imágenes',
        category: 'vocabulary',
        difficulty: 'easy',
        duration: 10,
        minAge: 5,
        maxAge: 12,
        image: '/images/games/word-guess.png',
        isActive: true,
        totalPlays: 1250,
        averageScore: 85,
        tags: ['vocabulario', 'imágenes', 'fácil']
      },
      {
        _id: '2',
        name: 'Sonidos del Habla',
        description: 'Practica la pronunciación de diferentes sonidos y fonemas',
        category: 'pronunciation',
        difficulty: 'medium',
        duration: 15,
        minAge: 6,
        maxAge: 15,
        image: '/images/games/speech-sounds.png',
        isActive: true,
        totalPlays: 890,
        averageScore: 78,
        tags: ['pronunciación', 'fonemas', 'intermedio']
      },
      {
        _id: '3',
        name: 'Comprensión Auditiva',
        description: 'Escucha historias cortas y responde preguntas de comprensión',
        category: 'comprehension',
        difficulty: 'hard',
        duration: 20,
        minAge: 8,
        maxAge: 16,
        image: '/images/games/listening.png',
        isActive: true,
        totalPlays: 650,
        averageScore: 72,
        tags: ['comprensión', 'auditivo', 'difícil']
      },
      {
        _id: '4',
        name: 'Fluidez en el Habla',
        description: 'Practica la fluidez con ejercicios de repetición y ritmo',
        category: 'fluency',
        difficulty: 'medium',
        duration: 12,
        minAge: 7,
        maxAge: 14,
        image: '/images/games/fluency.png',
        isActive: true,
        totalPlays: 420,
        averageScore: 81,
        tags: ['fluidez', 'ritmo', 'intermedio']
      },
      {
        _id: '5',
        name: 'Articulación Preciso',
        description: 'Mejora la articulación con ejercicios específicos de sonidos',
        category: 'articulation',
        difficulty: 'hard',
        duration: 18,
        minAge: 6,
        maxAge: 13,
        image: '/images/games/articulation.png',
        isActive: true,
        totalPlays: 320,
        averageScore: 75,
        tags: ['articulación', 'precisión', 'difícil']
      }
    ];

    res.json({
      success: true,
      data: { games }
    });
  } catch (error) {
    console.error('Error obteniendo juegos:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// Obtener progreso del usuario en juegos
export const getGameProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
    }

    // Datos de ejemplo de progreso
    const progress = [
      {
        gameId: '1',
        gameName: 'Adivina la Palabra',
        lastPlayed: '2025-09-02T15:30:00Z',
        totalPlays: 8,
        bestScore: 95,
        averageScore: 87,
        accuracy: 92,
        timeSpent: 45
      },
      {
        gameId: '2',
        gameName: 'Sonidos del Habla',
        lastPlayed: '2025-09-01T10:15:00Z',
        totalPlays: 5,
        bestScore: 88,
        averageScore: 82,
        accuracy: 85,
        timeSpent: 30
      }
    ];

    res.json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('Error obteniendo progreso:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// Obtener logros del usuario
export const getGameAchievements = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
    }

    // Datos de ejemplo de logros
    const achievements = [
      {
        _id: '1',
        name: 'Primer Juego',
        description: 'Completa tu primer juego de terapia',
        icon: '🎮',
        category: 'general',
        points: 10,
        isUnlocked: true,
        unlockedAt: '2025-08-28T14:20:00Z',
        progress: 100
      },
      {
        _id: '2',
        name: 'Vocabulario Básico',
        description: 'Completa 10 juegos de vocabulario',
        icon: '📚',
        category: 'vocabulary',
        points: 25,
        isUnlocked: true,
        unlockedAt: '2025-08-30T16:45:00Z',
        progress: 100
      },
      {
        _id: '3',
        name: 'Pronunciación Perfecta',
        description: 'Obtén 100% de precisión en un juego de pronunciación',
        icon: '🎯',
        category: 'pronunciation',
        points: 50,
        isUnlocked: false,
        progress: 75
      },
      {
        _id: '4',
        name: 'Comprensión Avanzada',
        description: 'Completa 5 juegos de comprensión con más del 80%',
        icon: '🧠',
        category: 'comprehension',
        points: 30,
        isUnlocked: false,
        progress: 60
      }
    ];

    res.json({
      success: true,
      data: { achievements }
    });
  } catch (error) {
    console.error('Error obteniendo logros:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

export default gameController;
