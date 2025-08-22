import { Request, Response, NextFunction } from 'express';
export declare const createSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getSessions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getSessionById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const joinSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const leaveSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const startSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const endSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getSessionParticipants: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=sessionController.d.ts.map