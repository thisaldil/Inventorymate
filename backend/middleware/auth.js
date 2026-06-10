import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/tokens.js';
import User from '../models/User.js';

export const protect = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.accessToken;
  if (!token) return next(new AppError('Authentication required', 401));

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).populate('role');
    if (!user || !user.active) return next(new AppError('User not authorized', 401));
    if ((user.tokenVersion || 0) !== (payload.ver || 0)) return next(new AppError('Session expired', 401));
    req.user = user;
    // Set req.userRole consistently so authorize() middleware always finds it
    req.userRole = typeof user.role === 'string' ? user.role : user.role?.name;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const optionalProtect = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.accessToken;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).populate('role');
    if (!user || !user.active) {
      req.user = null;
      return next();
    }
    if ((user.tokenVersion || 0) !== (payload.ver || 0)) {
      req.user = null;
      return next();
    }
    req.user = user;
    req.userRole = typeof user.role === 'string' ? user.role : user.role?.name;
    next();
  } catch {
    req.user = null;
    next();
  }
};