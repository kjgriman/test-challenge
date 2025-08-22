import { Request, Response, NextFunction } from 'express';

// Middleware para manejar errores en funciones async
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
