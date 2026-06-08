import { Router } from 'express';
import Technician from '../models/Technician.js';
import { createCrudController } from '../controllers/crudFactory.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();
const controller = createCrudController(Technician, { searchFields: ['employeeId', 'name', 'email', 'phone', 'department'], filterFields: ['status', 'department'] });

router.get('/', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'), controller.getAll);
router.get('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'), controller.getOne);
router.post('/', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'), controller.createOne);
router.put('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'), controller.updateOne);
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.deleteOne);

export const technicianRoutes = router;
