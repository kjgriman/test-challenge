import { Server, Socket } from 'socket.io';
import { GameManager, gameWords } from '../utils/gameData';

interface GameSession {
  sessionId: string;
  gameManager: GameManager;
  participants: {
    [userId: string]: {
      role: 'slp' | 'child';
      name: string;
    };
  };
  isPlaying: boolean;
  isPaused: boolean;
  currentRoundData: any;
}

class GameHandlers {
  private io: Server;
  private gameSessions: Map<string, GameSession> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  // Inicializar handlers
  initialize() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Cliente conectado: ${socket.id}`);

      // Handlers del juego
      socket.on('game:join', (data: { sessionId: string; userId: string; role: 'slp' | 'child'; name: string }) => {
        this.handleJoinGame(socket, data);
      });

      socket.on('game:start', (data: { sessionId: string; gameState: any }) => {
        this.handleStartGame(socket, data);
      });

      socket.on('game:answer', (data: { sessionId: string; playerId: string; answer: string; isCorrect: boolean }) => {
        this.handleAnswer(socket, data);
      });

      socket.on('game:pause', (data: { sessionId: string }) => {
        this.handlePauseGame(socket, data);
      });

      socket.on('game:resume', (data: { sessionId: string }) => {
        this.handleResumeGame(socket, data);
      });

      socket.on('game:reset', (data: { sessionId: string }) => {
        this.handleResetGame(socket, data);
      });

      socket.on('game:timeUp', (data: { sessionId: string }) => {
        this.handleTimeUp(socket, data);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  // Manejar unirse al juego
  private handleJoinGame(socket: Socket, data: { sessionId: string; userId: string; role: 'slp' | 'child'; name: string }) {
    const { sessionId, userId, role, name } = data;
    
    console.log(`🎮 Usuario ${name} (${role}) se unió al juego en sesión ${sessionId}`);

    // Unirse a la sala del juego
    socket.join(sessionId);

    // Crear o obtener sesión del juego
    let gameSession = this.gameSessions.get(sessionId);
    if (!gameSession) {
      gameSession = {
        sessionId,
        gameManager: new GameManager(gameWords),
        participants: {},
        isPlaying: false,
        isPaused: false,
        currentRoundData: null
      };
      this.gameSessions.set(sessionId, gameSession);
    }

    // Agregar participante
    gameSession.participants[userId] = { role, name };

    // Notificar a todos los participantes
    this.io.to(sessionId).emit('game:participantJoined', {
      userId,
      role,
      name,
      participants: Object.values(gameSession.participants)
    });

    console.log(`👥 Participantes en sesión ${sessionId}:`, Object.values(gameSession.participants));
  }

  // Manejar inicio del juego
  private handleStartGame(socket: Socket, data: { sessionId: string; gameState: any }) {
    const { sessionId, gameState } = data;
    const gameSession = this.gameSessions.get(sessionId);

    if (!gameSession) {
      socket.emit('game:error', { message: 'Sesión de juego no encontrada' });
      return;
    }

    console.log(`🚀 Iniciando juego en sesión ${sessionId}`);

    // Reiniciar el juego
    gameSession.gameManager.resetGame();
    gameSession.isPlaying = true;
    gameSession.isPaused = false;

    // Generar primera ronda
    const roundData = gameSession.gameManager.generateRoundData();
    gameSession.currentRoundData = roundData;

    // Notificar a todos los participantes
    this.io.to(sessionId).emit('game:start', {
      ...gameSession.gameManager.getGameState(),
      gameData: roundData
    });

    console.log(`🎯 Primera ronda generada: ${roundData.word}`);
  }

  // Manejar respuesta del jugador
  private handleAnswer(socket: Socket, data: { sessionId: string; playerId: string; answer: string; isCorrect: boolean }) {
    const { sessionId, playerId, answer } = data;
    const gameSession = this.gameSessions.get(sessionId);

    if (!gameSession || !gameSession.isPlaying) {
      socket.emit('game:error', { message: 'Juego no activo' });
      return;
    }

    const participant = gameSession.participants[playerId];
    if (!participant) {
      socket.emit('game:error', { message: 'Participante no encontrado' });
      return;
    }

    console.log(`🎯 Respuesta de ${participant.name}: ${answer}`);

    // Procesar respuesta
    const result = gameSession.gameManager.processAnswer(
      answer, 
      gameSession.currentRoundData.correctAnswer, 
      participant.role
    );

    // Notificar resultado a todos
    this.io.to(sessionId).emit('game:answer', {
      playerId,
      answer,
      isCorrect: result.isCorrect,
      points: result.points,
      newScore: result.newScore,
      playerName: participant.name,
      playerRole: participant.role
    });

    // Cambiar turno
    const newTurn = gameSession.gameManager.changeTurn();
    
    // Verificar si el juego terminó
    const gameState = gameSession.gameManager.getGameState();
    if (gameState.isGameOver) {
      this.handleGameOver(sessionId);
      return;
    }

    // Generar nueva ronda si la respuesta fue correcta
    if (result.isCorrect) {
      const hasMoreRounds = gameSession.gameManager.nextRound();
      if (hasMoreRounds) {
        const newRoundData = gameSession.gameManager.generateRoundData();
        gameSession.currentRoundData = newRoundData;

        // Notificar nueva ronda
        this.io.to(sessionId).emit('game:newRound', {
          ...gameSession.gameManager.getGameState(),
          gameData: newRoundData
        });

        console.log(`🔄 Nueva ronda: ${newRoundData.word}`);
      }
    } else {
      // Notificar cambio de turno
      this.io.to(sessionId).emit('game:turn', { currentTurn: newTurn });
    }
  }

  // Manejar pausa del juego
  private handlePauseGame(socket: Socket, data: { sessionId: string }) {
    const { sessionId } = data;
    const gameSession = this.gameSessions.get(sessionId);

    if (!gameSession) return;

    gameSession.isPaused = true;
    this.io.to(sessionId).emit('game:pause');
    console.log(`⏸️ Juego pausado en sesión ${sessionId}`);
  }

  // Manejar reanudar juego
  private handleResumeGame(socket: Socket, data: { sessionId: string }) {
    const { sessionId } = data;
    const gameSession = this.gameSessions.get(sessionId);

    if (!gameSession) return;

    gameSession.isPaused = false;
    this.io.to(sessionId).emit('game:resume');
    console.log(`▶️ Juego reanudado en sesión ${sessionId}`);
  }

  // Manejar reiniciar juego
  private handleResetGame(socket: Socket, data: { sessionId: string }) {
    const { sessionId } = data;
    const gameSession = this.gameSessions.get(sessionId);

    if (!gameSession) return;

    console.log(`🔄 Reiniciando juego en sesión ${sessionId}`);

    // Reiniciar el juego
    gameSession.gameManager.resetGame();
    gameSession.isPlaying = false;
    gameSession.isPaused = false;
    gameSession.currentRoundData = null;

    // Notificar a todos
    this.io.to(sessionId).emit('game:reset', {
      ...gameSession.gameManager.getGameState()
    });
  }

  // Manejar tiempo agotado
  private handleTimeUp(socket: Socket, data: { sessionId: string }) {
    const { sessionId } = data;
    const gameSession = this.gameSessions.get(sessionId);

    if (!gameSession || !gameSession.isPlaying) return;

    console.log(`⏰ Tiempo agotado en sesión ${sessionId}`);

    // Cambiar turno automáticamente
    const newTurn = gameSession.gameManager.changeTurn();
    
    // Notificar cambio de turno
    this.io.to(sessionId).emit('game:turn', { currentTurn: newTurn });
    this.io.to(sessionId).emit('game:timeUp');
  }

  // Manejar fin del juego
  private handleGameOver(sessionId: string) {
    const gameSession = this.gameSessions.get(sessionId);
    if (!gameSession) return;

    console.log(`🏁 Juego terminado en sesión ${sessionId}`);

    const finalScore = gameSession.gameManager.getGameState().score;
    const winner = gameSession.gameManager.getWinner();

    // Notificar fin del juego
    this.io.to(sessionId).emit('game:end', {
      finalScore,
      winner,
      gameState: gameSession.gameManager.getGameState()
    });

    // Limpiar sesión
    gameSession.isPlaying = false;
    gameSession.isPaused = false;
  }

  // Manejar desconexión
  private handleDisconnect(socket: Socket) {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);

    // Encontrar y limpiar sesiones del usuario
    for (const [sessionId, gameSession] of this.gameSessions.entries()) {
      const participantIndex = Object.keys(gameSession.participants).find(
        userId => socket.id === userId
      );

      if (participantIndex) {
        delete gameSession.participants[participantIndex];
        
        // Si no quedan participantes, eliminar la sesión
        if (Object.keys(gameSession.participants).length === 0) {
          this.gameSessions.delete(sessionId);
          console.log(`🗑️ Sesión ${sessionId} eliminada por falta de participantes`);
        } else {
          // Notificar a los participantes restantes
          this.io.to(sessionId).emit('game:participantLeft', {
            userId: participantIndex,
            participants: Object.values(gameSession.participants)
          });
        }
        break;
      }
    }
  }

  // Obtener estadísticas del juego
  getGameStats() {
    const stats = {
      activeSessions: this.gameSessions.size,
      totalParticipants: 0,
      activeGames: 0
    };

    for (const gameSession of this.gameSessions.values()) {
      stats.totalParticipants += Object.keys(gameSession.participants).length;
      if (gameSession.isPlaying) {
        stats.activeGames++;
      }
    }

    return stats;
  }
}

export default GameHandlers;
