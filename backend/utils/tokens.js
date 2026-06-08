import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role?.name, ver: user.tokenVersion || 0 }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString(), ver: user.tokenVersion || 0 }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });

export const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const createPasswordResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, hashedToken: hashResetToken(token) };
};

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_SECRET);
