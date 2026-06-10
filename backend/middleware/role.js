import { AppError } from '../utils/AppError.js';

export const authorize =
  (...roles) =>
  (req, _res, next) => {
    const roleName =
      req.userRole ||
      req.user?.role?.name ||
      req.user?.role;

    if (!roleName) {
      return next(
        new AppError(
          'Unauthorized',
          401
        )
      );
    }

    if (!roles.includes(roleName)) {
      return next(
        new AppError(
          'Forbidden',
          403
        )
      );
    }

    next();
  };