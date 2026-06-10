import Tool from '../models/Tool.js';
import SparePart from '../models/SparePart.js';
import Vehicle from '../models/Vehicle.js';
import Technician from '../models/Technician.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const countByStatus = async (Model) =>
  Model.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

export const getDashboard = asyncHandler(async (_req, res) => {
  const [
    totalTools,
    availableTools,
    reservedTools,
    inUseTools,
    maintenanceRequiredTools,

    totalSpareParts,
    lowStockParts,
    outOfStockParts,

    totalVehicles,

    activeTechnicians,

    pendingMaintenance,
    overdueMaintenance,

    inventoryValueResult,

    toolStatusDistribution,
    sparePartStatusDistribution,

    monthlyMaintenanceActivities,
    inventoryGrowth,
  ] = await Promise.all([
    // Tools
    Tool.countDocuments(),
    Tool.countDocuments({ status: 'Available' }),
    Tool.countDocuments({ status: 'Reserved' }),
    Tool.countDocuments({ status: 'In Use' }),
    Tool.countDocuments({ status: 'Maintenance Required' }),

    // Spare Parts
    SparePart.countDocuments(),

    SparePart.countDocuments({
      $expr: {
        $lte: ['$quantity', '$reorderLevel'],
      },
    }),

    SparePart.countDocuments({
      quantity: 0,
    }),

    // Vehicles
    Vehicle.countDocuments(),

    // Technicians
    Technician.countDocuments({
      status: 'Active',
    }),

    // Maintenance
    MaintenanceRecord.countDocuments({
      status: 'Pending',
    }),

    MaintenanceRecord.countDocuments({
      status: 'Overdue',
    }),

    // Inventory Value
    SparePart.aggregate([
      {
        $project: {
          totalValue: {
            $multiply: ['$quantity', '$unitCost'],
          },
        },
      },
      {
        $group: {
          _id: null,
          value: {
            $sum: '$totalValue',
          },
        },
      },
    ]),

    // Charts
    countByStatus(Tool),

    countByStatus(SparePart),

    MaintenanceRecord.aggregate([
      {
        $group: {
          _id: {
            $month: '$serviceDate',
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]),

    SparePart.aggregate([
      {
        $project: {
          month: {
            $month: '$createdAt',
          },
        },
      },
      {
        $group: {
          _id: '$month',
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]),
  ]);

  const inventoryValue =
    inventoryValueResult?.[0]?.value || 0;

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
        outOfStockParts,

        totalVehicles,

        activeTechnicians,

        pendingMaintenance,
        overdueMaintenance,

        inventoryValue,
      },

      charts: {
        toolStatusDistribution,
        sparePartStatusDistribution,
        monthlyMaintenanceActivities,
        inventoryGrowth,
      },
    },
  });
});