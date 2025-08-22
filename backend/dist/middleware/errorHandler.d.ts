import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
    code?: string;
}
export declare class OperationalError extends Error implements AppError {
    statusCode: number;
    isOperational: boolean;
    code: string;
    constructor(message: string, statusCode?: number, code?: string);
}
export declare class ValidationError extends OperationalError {
    constructor(message: string, code?: string);
}
export declare class AuthenticationError extends OperationalError {
    constructor(message?: string, code?: string);
}
export declare class AuthorizationError extends OperationalError {
    constructor(message?: string, code?: string);
}
export declare class NotFoundError extends OperationalError {
    constructor(message?: string, code?: string);
}
export declare class ConflictError extends OperationalError {
    constructor(message: string, code?: string);
}
export declare class RateLimitError extends OperationalError {
    constructor(message?: string, code?: string);
}
export declare const createMongooseValidationError: (error: any) => ValidationError;
export declare const createMongooseDuplicateError: (error: any) => ConflictError;
export declare const createMongooseCastError: (error: any) => ValidationError;
export declare const errorHandler: (error: AppError, req: Request, res: Response, _next: NextFunction) => void;
export declare const unhandledErrorHandler: (error: Error) => void;
export declare const unhandledRejectionHandler: (reason: any, promise: Promise<any>) => void;
export declare const asyncErrorHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const sendErrorResponse: (res: Response, statusCode: number, message: string, code?: string) => void;
export declare const sendSuccessResponse: (res: Response, data: any, message?: string, statusCode?: number) => void;
export declare const setupGlobalErrorHandlers: () => void;
//# sourceMappingURL=errorHandler.d.ts.map