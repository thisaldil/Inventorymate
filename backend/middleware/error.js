import { AppError } from '../utils/AppError.js';

export const errorHandler = (err, _req, res, _next) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((error) => error.message)
      .join(' ');
    return res.status(400).json({ success: false, message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `${field} already exists.`,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err instanceof AppError ? err.message : 'Internal Server Error';
  res.status(statusCode).json({ success: false, message });
};
