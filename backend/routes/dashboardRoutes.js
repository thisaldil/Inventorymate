import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/', protect, getDashboard);
export const dashboardRoutes = router;
