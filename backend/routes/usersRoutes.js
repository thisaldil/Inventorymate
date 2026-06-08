import { Router } from 'express';
import { createUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.post('/', protect, authorize('SUPER_ADMIN'), createUser);

export const usersRoutes = router;
