export interface GameWord {
  word: string;
  image: string;
  category: 'animals' | 'objects' | 'colors' | 'numbers' | 'emotions';
  difficulty: 'easy' | 'medium' | 'hard';
  alternatives: string[];
}

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
  type: 'gameStart' | 'gameEnd' | 'roundStart' | 'roundEnd' | 'answerSelected' | 'turnChange' | 'timeUp' | 'pause' | 'resume' | 'participantJoined' | 'participantLeft';
  data: any;
  timestamp: number;
  userId: string;
  sessionId?: string;
}

export interface GameSession {
  sessionId: string;
  gameState: GameState;
  participants: Map<string, GameParticipant>;
  events: GameEvent[];
  createdAt: Date;
  lastActivity: Date;
}

export interface JoinGameRequest {
  sessionId: string;
  userId: string;
  userRole: 'slp' | 'child';
}

export interface GameEventRequest {
  sessionId: string;
  event: GameEvent;
}

export interface GameMetrics {
  totalGames: number;
  totalRounds: number;
  averageScore: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageGameDuration: number;
  mostPlayedCategory: string;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface PlayerStats {
  userId: string;
  totalGames: number;
  totalScore: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageScore: number;
  accuracy: number;
  favoriteCategory: string;
  improvementTrend: number[];
  lastPlayed: Date;
}
