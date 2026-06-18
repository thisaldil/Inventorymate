import { Router } from 'express';
import SparePart from '../models/SparePart.js';
import { createCrudController } from '../controllers/crudFactory.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

const controller = createCrudController(SparePart, {
  // Removed 'compatibleVehicleMake' and 'compatibleVehicleModel' — these are not top-level
  // fields; they live inside compatibleVehicles[].make / .model. The crudFactory regex search
  // won't reach nested array fields. Use 'compatibleVehicles.make' / 'compatibleVehicles.model'
  // if you upgrade crudFactory to support dot-notation, or add a dedicated search endpoint.
  searchFields: ['partNumber', 'partName', 'category', 'brand', 'oemNumber'],
  filterFields: ['status', 'category', 'partCondition'],
  populate: ['warehouse', 'supplier'],
});
router.post('/bulk-import', authenticate, authorize(['SUPER_ADMIN', 'INVENTORY_MANAGER']), bulkImport);

router.get('/', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'), controller.getAll);
router.get('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'), controller.getOne);
router.post('/', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.createOne);
router.put('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.updateOne);
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.deleteOne);

export const sparePartRoutes = router;