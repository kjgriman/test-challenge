import { Request, Response, NextFunction } from 'express';
export declare const rateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const wsRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const sessionRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const gameRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const dynamicRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
export declare const getRateLimitInfo: (req: Request) => {
    ip: string;
    userId: any;
    userRole: any;
    timestamp: string;
};
export declare const logRateLimitAttempt: (req: Request, endpoint: string) => void;
//# sourceMappingURL=rateLimiter.d.ts.map