import { Router } from 'express';
import Supplier from '../models/Supplier.js';
import { createCrudController } from '../controllers/crudFactory.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();
const controller = createCrudController(Supplier, {
  searchFields: ['supplierCode', 'name', 'email', 'phone'],
  filterFields: ['status'],
});

router.get('/',    protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'), controller.getAll);

// ✅ bulk-import BEFORE /:id
router.post('/bulk-import', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.bulkImport);

router.get('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'), controller.getOne);
router.post('/',   protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.createOne);
router.put('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.updateOne);
router.delete('/:id', protect, authorize('SUPER_ADMIN'), controller.deleteOne);

export const supplierRoutes = router;