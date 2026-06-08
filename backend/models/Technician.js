import mongoose from 'mongoose';

const technicianSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    department: { type: String, trim: true },
    status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' },
    assignedTools: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tool' }],
  },
  { timestamps: true },
);

export default mongoose.model('Technician', technicianSchema);
