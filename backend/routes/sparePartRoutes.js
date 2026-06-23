import { Router } from 'express';
import SparePart from '../models/SparePart.js';
import '../models/Warehouse.js';
import '../models/Supplier.js';
import { createCrudController } from '../controllers/crudFactory.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

const controller = createCrudController(SparePart, {
  searchFields: ['partNumber', 'partName', 'category', 'brand', 'vehicleBrand', 'vehicleModel', 'oemNumber'],
  filterFields: ['status', 'category', 'partCondition', 'vehicleBrand', 'vehicleModel'],
  populate: ['warehouse', 'supplier'],
});

// ✅ bulk-import BEFORE /:id, using protect + no array brackets + controller.bulkImport
router.post('/bulk-import', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.bulkImport);

router.get('/',     controller.getAll);
router.get('/:id',  protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'), controller.getOne);
router.post('/',    protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.createOne);
router.put('/:id',  protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.updateOne);
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.deleteOne);

export const sparePartRoutes = router;
