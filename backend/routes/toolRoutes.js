import { Router } from 'express';
import Tool from '../models/Tool.js';
import '../models/Warehouse.js';
import '../models/Technician.js';
import { createCrudController } from '../controllers/crudFactory.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { upload } from '../middleware/upload.js';

const router = Router();
const controller = createCrudController(Tool, {
  searchFields: ['toolId', 'toolName', 'brand', 'serialNumber', 'category'],
  filterFields: ['status', 'category', 'brand'],
  populate: ['warehouse', 'assignedTechnician'],
});

router.get('/',    controller.getAll);

// ✅ bulk-import BEFORE /:id
router.post('/bulk-import', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.bulkImport);

router.get('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'), controller.getOne);
router.post('/',   protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), upload.single('toolImage'), (req, _res, next) => {
  if (req.file) req.body.toolImage = `/uploads/${req.file.filename}`;
  next();
}, controller.createOne);
router.put('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), upload.single('toolImage'), (req, _res, next) => {
  if (req.file) req.body.toolImage = `/uploads/${req.file.filename}`;
  next();
}, controller.updateOne);
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.deleteOne);

export const toolRoutes = router;
