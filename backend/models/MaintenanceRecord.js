import mongoose from 'mongoose';

const maintenanceRecordSchema = new mongoose.Schema(
  {
    maintenanceId: { type: String, required: true, unique: true, trim: true },
    toolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tool', required: true },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', required: true },
    serviceDate: { type: Date, required: true },
    nextServiceDate: { type: Date, required: true },
    description: { type: String, required: true, trim: true },
    cost: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, enum: ['Pending', 'Completed', 'Overdue'], default: 'Pending' },
  },
  { timestamps: true },
);

export default mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
