import mongoose, { Document } from 'mongoose';
export declare enum SessionStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum ActivityType {
    PRONUNCIATION = "pronunciation",
    LANGUAGE_COMPREHENSION = "language_comprehension",
    FLUENCY = "fluency",
    VOCAL_EXERCISES = "vocal_exercises",
    INTERACTIVE_GAME = "interactive_game"
}
export interface IGameResult {
    word: string;
    pronunciation: 'correct' | 'incorrect' | 'partial';
    timestamp: Date;
    notes?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeSpent: number;
    attempts: number;
}
export interface ISessionMetrics {
    totalActivities: number;
    correctAnswers: number;
    incorrectAnswers: number;
    partialAnswers: number;
    accuracyPercentage: number;
    averageResponseTime: number;
    totalSessionTime: number;
    engagementScore: number;
}
export interface ITherapySession extends Document {
    slpId: mongoose.Types.ObjectId;
    childId: mongoose.Types.ObjectId;
    status: SessionStatus;
    scheduledDate: Date;
    startTime?: Date;
    endTime?: Date;
    activities: {
        type: ActivityType;
        description: string;
        duration: number;
        completed: boolean;
    }[];
    gameResults: IGameResult[];
    metrics: ISessionMetrics;
    slpNotes: string;
    behavioralObservations: string[];
    aiSummary?: string;
    duration?: number;
    notes?: string;
    goals?: string[];
    gamesPlayed?: number;
    accuracy?: number;
    totalScore?: number;
    lastGameAccuracy?: number;
    lastGameDate?: Date;
    calculateMetrics(): void;
    getDuration(): number;
    getAccuracy(): number;
    isActive(): boolean;
}
export declare const TherapySession: mongoose.Model<ITherapySession, {}, {}, {}, mongoose.Document<unknown, {}, ITherapySession, {}, {}> & ITherapySession & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=TherapySession.d.ts.map