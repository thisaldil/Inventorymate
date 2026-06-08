import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    action: String,
    note: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
  },
  { _id: false },
);

const toolSchema = new mongoose.Schema(
  {
    toolId: { type: String, required: true, unique: true, trim: true },
    toolName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    serialNumber: { type: String, unique: true, sparse: true, trim: true },
    status: { type: String, enum: ['Available', 'In Use', 'Reserved', 'Maintenance Required', 'Out Of Service'], default: 'Available' },
    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
    purchaseDate: Date,
    lastServiceDate: Date,
    nextServiceDate: Date,
    toolImage: String,
    notes: String,
    history: [historySchema],
  },
  { timestamps: true },
);

export default mongoose.model('Tool', toolSchema);
