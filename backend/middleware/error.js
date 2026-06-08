import { AppError } from '../utils/AppError.js';

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err instanceof AppError ? err.message : 'Internal Server Error';
  res.status(statusCode).json({ success: false, message });
};
