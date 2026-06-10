import { AppError } from '../utils/AppError.js';

export const requirePermission =
  (...permissions) =>
  (req, _res, next) => {
    const userPermissions =
      req.user?.role?.permissions || [];

    const allowed = permissions.some(
      (permission) =>
        userPermissions.includes(permission)
    );

    if (!allowed) {
      return next(
        new AppError(
          'Permission denied',
          403
        )
      );
    }

    next();
  };