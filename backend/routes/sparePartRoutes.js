import { Router } from 'express';
import SparePart from '../models/SparePart.js';
import { createCrudController } from '../controllers/crudFactory.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();
const controller = createCrudController(SparePart, { searchFields: ['partNumber', 'partName', 'category', 'supplier', 'compatibleVehicleMake', 'compatibleVehicleModel'], filterFields: ['status', 'category', 'compatibleVehicleMake', 'compatibleVehicleModel'] });

router.get('/', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'), controller.getAll);
router.get('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'), controller.getOne);
router.post('/', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.createOne);
router.put('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.updateOne);
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.deleteOne);

export const sparePartRoutes = router;
