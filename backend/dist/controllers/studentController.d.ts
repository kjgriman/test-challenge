import { Request, Response, NextFunction } from 'express';
export declare const getStudents: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getStudentById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createStudent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateStudent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteStudent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getStudentProgress: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const assignStudentToSLP: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const removeStudentFromSLP: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=studentController.d.ts.map