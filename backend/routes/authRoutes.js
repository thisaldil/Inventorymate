import { Router } from 'express';
import {
  changePassword,
  createAdmin,
  forgotPassword,
  login,
  logout,
  me,
  resetPassword,
  getRoles,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, me);
// Restrict role listing to SUPER_ADMIN only
router.get('/roles', protect, authorize('SUPER_ADMIN'), getRoles);
router.post('/create-admin', createAdmin);

export const authRoutes = router;