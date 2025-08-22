import { Response } from 'express';

// Función para enviar respuestas exitosas
export const sendSuccessResponse = (
  res: Response,
  data: any,
  message: string = 'Operación exitosa',
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Función para enviar respuestas de error
export const sendErrorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: any
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env['NODE_ENV'] === 'development' ? error : undefined,
    timestamp: new Date().toISOString()
  });
};
