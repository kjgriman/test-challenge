import { Request, Response, NextFunction } from 'express';
export declare const registerSLP: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const registerChild: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const changePassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map