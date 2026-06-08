import { Router } from 'express';
import Vehicle from '../models/Vehicle.js';
import { createCrudController } from '../controllers/crudFactory.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { upload } from '../middleware/upload.js';

const router = Router();
const controller = createCrudController(Vehicle, { searchFields: ['vehicleId', 'make', 'model', 'registrationNumber', 'chassisNumber', 'color'], filterFields: ['status', 'make', 'model', 'year'] });

router.get('/', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'), controller.getAll);
router.get('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'), controller.getOne);
router.post('/', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), upload.array('images', 10), (req, _res, next) => {
  if (req.files?.length) req.body.images = req.files.map((file) => `/uploads/${file.filename}`);
  next();
}, controller.createOne);
router.put('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), upload.array('images', 10), (req, _res, next) => {
  if (req.files?.length) req.body.images = req.files.map((file) => `/uploads/${file.filename}`);
  next();
}, controller.updateOne);
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), controller.deleteOne);

export const vehicleRoutes = router;
