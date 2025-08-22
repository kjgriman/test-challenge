import mongoose, { Document } from 'mongoose';
export declare enum GameStatus {
    WAITING = "waiting",
    ACTIVE = "active",
    PAUSED = "paused",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum GameType {
    PRONUNCIATION_PRACTICE = "pronunciation_practice",
    WORD_RECOGNITION = "word_recognition",
    SOUND_MATCHING = "sound_matching",
    LANGUAGE_COMPREHENSION = "language_comprehension"
}
export declare enum GameDifficulty {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard"
}
export interface IGameState {
    currentWord: string;
    currentPlayer: 'slp' | 'child';
    turnNumber: number;
    maxTurns: number;
    score: {
        slp: number;
        child: number;
    };
    currentRound: number;
    totalRounds: number;
    timeRemaining: number;
    isPaused: boolean;
}
export interface IGameAction {
    playerId: mongoose.Types.ObjectId;
    playerType: 'slp' | 'child';
    action: 'word_pronounced' | 'evaluation_given' | 'turn_skipped' | 'game_paused';
    timestamp: Date;
    data?: {
        word?: string;
        pronunciation?: 'correct' | 'incorrect' | 'partial';
        notes?: string;
        timeSpent?: number;
    };
}
export interface IGame extends Document {
    sessionId: mongoose.Types.ObjectId;
    gameType: GameType;
    difficulty: GameDifficulty;
    status: GameStatus;
    slpId: mongoose.Types.ObjectId;
    childId: mongoose.Types.ObjectId;
    gameState: IGameState;
    actions: IGameAction[];
    settings: {
        timePerTurn: number;
        maxAttemptsPerWord: number;
        enableHints: boolean;
        enableSoundEffects: boolean;
        autoAdvance: boolean;
    };
    startGame(): void;
    pauseGame(): void;
    resumeGame(): void;
    endGame(): void;
    nextTurn(): void;
    evaluatePronunciation(word: string, pronunciation: 'correct' | 'incorrect' | 'partial', notes?: string): void;
    getCurrentPlayer(): 'slp' | 'child';
    getGameProgress(): number;
    isGameOver(): boolean;
    getWinner(): 'slp' | 'child' | 'tie' | null;
}
export declare const Game: mongoose.Model<IGame, {}, {}, {}, mongoose.Document<unknown, {}, IGame, {}, {}> & IGame & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Game.d.ts.map