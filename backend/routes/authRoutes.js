import { Router } from 'express';
import { changePassword, createAdmin, forgotPassword, login, logout, me, resetPassword, bootstrapAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, me);
router.get('/roles', protect, bootstrapAdmin);
router.post('/create-admin', createAdmin);

export const authRoutes = router;
