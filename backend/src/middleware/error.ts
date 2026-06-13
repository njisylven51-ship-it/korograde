import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('🛡️ Express Boundary Caught Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // Include stack trace only in non-production environments
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}
