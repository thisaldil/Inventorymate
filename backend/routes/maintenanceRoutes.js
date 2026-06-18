import { Router } from 'express';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import { createCrudController } from '../controllers/crudFactory.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

const controller = createCrudController(MaintenanceRecord, {
  searchFields: ['maintenanceId', 'maintenanceType', 'description'],
  filterFields: ['status', 'priority'],
  populate: ['toolId', 'vehicleId', 'technician'],
});
router.post('/bulk-import', authenticate, authorize(['SUPER_ADMIN', 'WORKSHOP_MANAGER']), bulkImport);

router.get('/', protect, authorize('SUPER_ADMIN', 'WORKSHOP_MANAGER', 'INVENTORY_MANAGER'), controller.getAll);
router.get('/:id', protect, authorize('SUPER_ADMIN', 'WORKSHOP_MANAGER', 'INVENTORY_MANAGER'), controller.getOne);
router.post('/', protect, authorize('SUPER_ADMIN', 'WORKSHOP_MANAGER'), controller.createOne);
router.put('/:id', protect, authorize('SUPER_ADMIN', 'WORKSHOP_MANAGER'), controller.updateOne);
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'WORKSHOP_MANAGER'), controller.deleteOne);

export const maintenanceRoutes = router;