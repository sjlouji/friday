import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  if (err.statusCode === 500) {
    logger.error(
      `${req.method} ${req.path} - ${err.statusCode} - ${err.message}`,
      { stack: err.stack }
    );
  } else {
    logger.warn(`${req.method} ${req.path} - ${err.statusCode} - ${err.message}`);
  }

  // Response for client
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
