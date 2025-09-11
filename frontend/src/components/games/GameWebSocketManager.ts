import { io, Socket } from 'socket.io-client';
import { GameWord, gameWords } from './GameData';

export interface GameState {
  isPlaying: boolean;
  currentTurn: 'slp' | 'child';
  score: { slp: number; child: number };
  round: number;
  maxRounds: number;
  currentWord: GameWord | null;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  timeRemaining: number;
  isPaused: boolean;
  participants: GameParticipant[];
}

export interface GameParticipant {
  userId: string;
  name: string;
  role: 'slp' | 'child';
  isConnected: boolean;
  score: number;
}

export interface GameResults {
  score: { slp: number; child: number };
  totalRounds: number;
  correctAnswers: { slp: number; child: number };
  winner: 'slp' | 'child' | 'tie';
  duration: number;
  participants: GameParticipant[];
}

export interface GameEvent {
  type: 'gameStart' | 'gameEnd' | 'roundStart' | 'roundEnd' | 'answerSelected' | 'turnChange' | 'timeUp' | 'pause' | 'resume';
  data: any;
  timestamp: number;
  userId: string;
}

class GameWebSocketManager {
  private socket: Socket | null = null;
  private sessionId: string;
  private userId: string;
  private userRole: 'slp' | 'child';
  private gameState: GameState;
  private eventHandlers: Map<string, Function[]> = new Map();
  private gameStartTime: number = 0;
  private usedWords: string[] = [];

  constructor(sessionId: string, userId: string, userRole: 'slp' | 'child') {
    this.sessionId = sessionId;
    this.userId = userId;
    this.userRole = userRole;
    this.gameState = this.getInitialGameState();
  }

  private getInitialGameState(): GameState {
    return {
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
  }

  // Conectar al servidor WebSocket
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const socketUrl = this.getSocketUrl();
        console.log('🔌 Conectando WebSocket a:', socketUrl);
        console.log('🔑 Token recibido:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
        console.log('🔑 Token completo:', token);
        
        // Timeout de seguridad
        const timeout = setTimeout(() => {
          console.error('⏰ Timeout de conexión WebSocket');
          reject(new Error('Timeout de conexión'));
        }, 15000);
        
        this.socket = io(socketUrl, {
          auth: {
            token
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          forceNew: true
        });

        this.socket.on('connect', () => {
          console.log('🎮 Conectado al servidor de juegos');
          clearTimeout(timeout);
          this.joinGameSession();
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Error conectando al servidor de juegos:', error);
          console.error('❌ Detalles del error:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
          clearTimeout(timeout);
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Desconectado del servidor de juegos. Razón:', reason);
        });

        this.setupEventListeners();
      } catch (error) {
        reject(error);
      }
    });
  }

  private getSocketUrl(): string {
    const isDevelopment = import.meta.env.DEV;
    if (isDevelopment) {
      return 'https://localhost:3001';
    }
    return import.meta.env.VITE_API_URL || 'https://localhost:3001';
  }

  private joinGameSession() {
    if (this.socket) {
      this.socket.emit('joinGameSession', {
        sessionId: this.sessionId,
        userId: this.userId,
        userRole: this.userRole
      });
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Eventos del servidor
    this.socket.on('gameStateUpdate', (newState: GameState) => {
      console.log('🔄 Estado del juego actualizado:', newState);
      this.gameState = newState;
      this.emit('gameStateUpdate', newState);
    });

    this.socket.on('gameEvent', (event: GameEvent) => {
      console.log('📡 Evento del juego recibido:', event);
      this.handleGameEvent(event);
    });

    this.socket.on('participantJoined', (participant: GameParticipant) => {
      console.log('👤 Participante se unió:', participant);
      this.gameState.participants.push(participant);
      this.emit('participantJoined', participant);
    });

    this.socket.on('participantLeft', (userId: string) => {
      console.log('👤 Participante se fue:', userId);
      this.gameState.participants = this.gameState.participants.filter(p => p.userId !== userId);
      this.emit('participantLeft', userId);
    });

    this.socket.on('gameError', (error: string) => {
      console.error('❌ Error en el juego:', error);
      this.emit('gameError', error);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Desconectado del servidor de juegos');
      this.emit('disconnected');
    });
  }

  private handleGameEvent(event: GameEvent) {
    switch (event.type) {
      case 'gameStart':
        this.gameState.isPlaying = true;
        this.gameState.currentWord = event.data.currentWord;
        this.gameStartTime = Date.now();
        this.emit('gameStart', event.data);
        break;

      case 'gameEnd':
        this.gameState.isPlaying = false;
        const duration = Date.now() - this.gameStartTime;
        const results: GameResults = {
          ...event.data,
          duration,
          participants: this.gameState.participants
        };
        this.emit('gameEnd', results);
        break;

      case 'roundStart':
        this.gameState.currentWord = event.data.currentWord;
        this.gameState.round = event.data.round;
        this.gameState.timeRemaining = 30;
        this.gameState.selectedAnswer = null;
        this.gameState.isCorrect = null;
        this.emit('roundStart', event.data);
        break;

      case 'roundEnd':
        this.gameState.score = event.data.score;
        this.emit('roundEnd', event.data);
        break;

      case 'answerSelected':
        this.gameState.selectedAnswer = event.data.answer;
        this.gameState.isCorrect = event.data.isCorrect;
        this.emit('answerSelected', event.data);
        break;

      case 'turnChange':
        this.gameState.currentTurn = event.data.newTurn;
        this.gameState.timeRemaining = 30;
        this.emit('turnChange', event.data);
        break;

      case 'timeUp':
        this.gameState.timeRemaining = 0;
        this.emit('timeUp');
        break;

      case 'pause':
        this.gameState.isPaused = true;
        this.emit('gamePaused');
        break;

      case 'resume':
        this.gameState.isPaused = false;
        this.emit('gameResumed');
        break;
    }
  }

  // Métodos para controlar el juego
  startGame(): void {
    if (!this.socket) return;

    const word = this.getRandomWord();
    this.gameStartTime = Date.now();
    
    const event: GameEvent = {
      type: 'gameStart',
      data: {
        currentWord: word,
        round: 1,
        maxRounds: this.gameState.maxRounds
      },
      timestamp: Date.now(),
      userId: this.userId
    };

    this.socket.emit('gameEvent', {
      sessionId: this.sessionId,
      event: event
    });
  }

  selectAnswer(answer: string): void {
    if (!this.socket || !this.gameState.currentWord) return;

    const isCorrect = answer === this.gameState.currentWord.word;
    
    const event: GameEvent = {
      type: 'answerSelected',
      data: {
        answer,
        isCorrect,
        currentWord: this.gameState.currentWord.word,
        userId: this.userId,
        userRole: this.userRole
      },
      timestamp: Date.now(),
      userId: this.userId
    };

    this.socket.emit('gameEvent', {
      sessionId: this.sessionId,
      event: event
    });
  }

  pauseGame(): void {
    if (!this.socket) return;

    const event: GameEvent = {
      type: 'pause',
      data: {},
      timestamp: Date.now(),
      userId: this.userId
    };

    this.socket.emit('gameEvent', {
      sessionId: this.sessionId,
      event: event
    });
  }

  resumeGame(): void {
    if (!this.socket) return;

    const event: GameEvent = {
      type: 'resume',
      data: {},
      timestamp: Date.now(),
      userId: this.userId
    };

    this.socket.emit('gameEvent', {
      sessionId: this.sessionId,
      event: event
    });
  }

  endGame(): void {
    if (!this.socket) return;

    const duration = Date.now() - this.gameStartTime;
    const results: GameResults = {
      score: this.gameState.score,
      totalRounds: this.gameState.maxRounds,
      correctAnswers: {
        slp: Math.floor(this.gameState.score.slp / 10),
        child: Math.floor(this.gameState.score.child / 10)
      },
      winner: this.getWinner(),
      duration,
      participants: this.gameState.participants
    };

    const event: GameEvent = {
      type: 'gameEnd',
      data: results,
      timestamp: Date.now(),
      userId: this.userId
    };

    this.socket.emit('gameEvent', {
      sessionId: this.sessionId,
      event: event
    });
  }

  // Utilidades
  private getRandomWord(): GameWord {
    const availableWords = gameWords.filter(word => !this.usedWords.includes(word.word));
    
    if (availableWords.length === 0) {
      this.usedWords = [];
      return gameWords[Math.floor(Math.random() * gameWords.length)];
    }

    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    this.usedWords.push(randomWord.word);
    return randomWord;
  }

  private getWinner(): 'slp' | 'child' | 'tie' {
    if (this.gameState.score.slp > this.gameState.score.child) return 'slp';
    if (this.gameState.score.child > this.gameState.score.slp) return 'child';
    return 'tie';
  }

  // Sistema de eventos
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Getters
  getGameState(): GameState {
    return { ...this.gameState };
  }

  getParticipants(): GameParticipant[] {
    return [...this.gameState.participants];
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Desconectar
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventHandlers.clear();
  }
}

export default GameWebSocketManager;
