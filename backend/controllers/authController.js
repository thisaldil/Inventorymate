import User from '../models/User.js';
import Role from '../models/Role.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import { createPasswordResetToken, signAccessToken, signRefreshToken, hashResetToken } from '../utils/tokens.js';

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  active: user.active,
});

const sendAuth = (res, user, statusCode = 200) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  return res.status(statusCode).json({ success: true, data: { user: userPayload(user), accessToken, refreshToken } });
};

const populateRole = (user) => user.populate('role');

const resolveRole = async (roleInput, fallbackRoleName) => {
  const roleName = roleInput || fallbackRoleName;
  const role = await Role.findOne({ name: roleName });
  if (!role) throw new AppError(`Role not found: ${roleName}`, 400);
  return role;
};

export const createUser = asyncHandler(async (req, res, next) => {
  if (!req.user) return next(new AppError('Authentication required', 401));

  const { name, email, password, phone, role, active = true } = req.body;

  if (!name || !email || !password) return next(new AppError('Name, email, and password are required', 400));
  if (password.length < 8) return next(new AppError('Password must be at least 8 characters', 400));

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return next(new AppError('A user with that email already exists', 409));

  const roleDoc = await resolveRole(role, 'INVENTORY_MANAGER');
  const createdUser = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    role: roleDoc._id,
    active,
  });

  const safeUser = await populateRole(createdUser);
  res.status(201).json({ success: true, data: userPayload(safeUser) });
});

export const createAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, active = true } = req.body;

  if (!name || !email || !password) return next(new AppError('Name, email, and password are required', 400));
  if (password.length < 8) return next(new AppError('Password must be at least 8 characters', 400));

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return next(new AppError('A user with that email already exists', 409));

  const userCount = await User.countDocuments();
  if (userCount > 0) {
    if (!req.user) return next(new AppError('Authentication required', 401));
    const requesterRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name;
    if (requesterRole !== 'SUPER_ADMIN') return next(new AppError('Forbidden', 403));
  }

  const roleDoc = await resolveRole('SUPER_ADMIN');
  const createdAdmin = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    role: roleDoc._id,
    active,
  });

  const safeAdmin = await populateRole(createdAdmin);
  res.status(201).json({ success: true, data: userPayload(safeAdmin) });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Email and password are required', 400));

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('role');
  if (!user || !(await user.comparePassword(password))) return next(new AppError('Invalid credentials', 401));

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  sendAuth(res, user);
});

export const logout = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError('User not found', 404));
  user.tokenVersion += 1;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'Logged out' });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return next(new AppError('Current and new password are required', 400));

  const user = await User.findById(req.user._id).select('+password').populate('role');
  if (!user || !(await user.comparePassword(currentPassword))) return next(new AppError('Current password is incorrect', 401));

  user.password = newPassword;
  user.tokenVersion += 1;
  await user.save();
  sendAuth(res, user);
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError('Email is required', 400));

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return next(new AppError('If that email exists, a reset link will be sent', 200));

  const { token, hashedToken } = createPasswordResetToken();
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 1000 * 60 * 30;
  await user.save({ validateBeforeSave: false });

  const resetLink = `${env.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
  console.log(`Password reset link for ${user.email}: ${resetLink}`);

  res.json({ success: true, message: 'Password reset link generated' });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) return next(new AppError('Email, token, and new password are required', 400));

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.passwordResetToken || !user.passwordResetExpires) return next(new AppError('Reset token is invalid or expired', 400));
  if (user.passwordResetExpires < Date.now()) return next(new AppError('Reset token is expired', 400));
  if (user.passwordResetToken !== hashResetToken(token)) return next(new AppError('Reset token is invalid', 400));

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.tokenVersion += 1;
  await user.save();
  sendAuth(res, await User.findById(user._id).populate('role'));
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: userPayload(req.user) });
});

// Renamed from bootstrapAdmin — this simply returns available roles for use in forms/UI
export const getRoles = asyncHandler(async (_req, res) => {
  const roles = await Role.find().sort('name');
  res.json({ success: true, data: roles });
});