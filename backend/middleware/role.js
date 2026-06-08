import { AppError } from '../utils/AppError.js';

export const authorize = (...roles) => (req, _res, next) => {
  const roleName = req.user?.role?.name || req.user?.role;
  if (!roleName || !roles.includes(roleName)) {
    return next(new AppError('Forbidden', 403));
  }
  next();
};
