import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, enum: ['SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'] },
    description: { type: String, required: true },
    permissions: [{ type: String, required: true }],
  },
  { timestamps: true },
);

export default mongoose.model('Role', roleSchema);
