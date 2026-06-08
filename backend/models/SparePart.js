import mongoose from 'mongoose';

const sparePartSchema = new mongoose.Schema(
  {
    partNumber: { type: String, required: true, unique: true, trim: true },
    partName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    compatibleVehicleMake: { type: String, trim: true },
    compatibleVehicleModel: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    minimumQuantity: { type: Number, required: true, min: 0, default: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    supplier: { type: String, trim: true },
    status: { type: String, enum: ['In Stock', 'Limited', 'On Order', 'Out Of Stock'], default: 'In Stock' },
  },
  { timestamps: true },
);

export default mongoose.model('SparePart', sparePartSchema);
