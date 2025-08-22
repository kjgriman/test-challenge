import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
declare global {
    namespace Express {
        interface Request {
            user?: any;
            token?: string;
        }
    }
}
interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat: number;
    exp: number;
}
export declare const generateToken: (user: any) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (roles: UserRole | UserRole[]) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireSLP: (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireChild: (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireSLPOrChild: (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireOwnership: (resourceField?: string) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireSessionAccess: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const isSLP: (req: Request, _res: Response, next: NextFunction) => void;
export declare const refreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const invalidateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCurrentUser: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=auth.d.ts.map