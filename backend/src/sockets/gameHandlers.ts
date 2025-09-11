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
    // Los eventos de juegos se manejarán a través del handler global
    // No crear handler de conexión aquí para evitar conflictos
    console.log('🎮 GameHandlers configurado - usando handler global');
  }
}

export default GameHandlers;
