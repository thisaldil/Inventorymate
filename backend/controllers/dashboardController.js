import Tool from '../models/Tool.js';
import SparePart from '../models/SparePart.js';
import Vehicle from '../models/Vehicle.js';
import Technician from '../models/Technician.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const countByStatus = async (Model) => Model.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

export const getDashboard = asyncHandler(async (_req, res) => {
  const [
    totalTools,
    availableTools,
    reservedTools,
    inUseTools,
    maintenanceRequiredTools,
    totalSpareParts,
    lowStockParts,
    totalVehicles,
    activeTechnicians,
    toolStatusDistribution,
    sparePartsStockLevels,
    monthlyMaintenanceActivities,
    inventoryGrowth,
  ] = await Promise.all([
    Tool.countDocuments(),
    Tool.countDocuments({ status: 'Available' }),
    Tool.countDocuments({ status: 'Reserved' }),
    Tool.countDocuments({ status: 'In Use' }),
    Tool.countDocuments({ status: 'Maintenance Required' }),
    SparePart.countDocuments(),
    SparePart.countDocuments({ $expr: { $lte: ['$quantity', '$minimumQuantity'] } }),
    Vehicle.countDocuments(),
    Technician.countDocuments({ status: 'Active' }),
    countByStatus(Tool),
    countByStatus(SparePart),
    MaintenanceRecord.aggregate([
      { $group: { _id: { $month: '$serviceDate' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Tool.aggregate([
      { $project: { month: { $month: '$createdAt' } } },
      { $group: { _id: '$month', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      cards: {
        totalTools,
        availableTools,
        reservedTools,
        inUseTools,
        maintenanceRequiredTools,
        totalSpareParts,
        lowStockParts,
        totalVehicles,
        activeTechnicians,
      },
      charts: {
        toolStatusDistribution,
        sparePartsStockLevels,
        monthlyMaintenanceActivities,
        inventoryGrowth,
      },
    },
  });
});
