import mongoose from 'mongoose';

const maintenanceRecordSchema = new mongoose.Schema(
  {
    maintenanceId: {
      type: String,
      unique: true,
      required: true,
    },

    toolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tool',
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },

    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician',
      required: true,
    },

    maintenanceType: String,

    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },

    serviceDate: Date,

    nextServiceDate: Date,

    completedDate: Date,

    description: String,

    laborHours: Number,

    cost: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        'Pending',
        'In Progress',
        'Completed',
        'Overdue',
      ],
      default: 'Pending',
    },

    remarks: String,
  },
  { timestamps: true }
);

export default mongoose.model(
  'MaintenanceRecord',
  maintenanceRecordSchema
);