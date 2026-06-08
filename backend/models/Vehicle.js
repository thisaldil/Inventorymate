import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, unique: true, trim: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1950, max: new Date().getFullYear() + 1 },
    chassisNumber: { type: String, required: true, unique: true, trim: true },
    registrationNumber: { type: String, required: true, unique: true, trim: true },
    color: { type: String, trim: true },
    status: { type: String, enum: ['Available', 'Reserved', 'Under Repair', 'Sold'], default: 'Available' },
    images: [{ type: String }],
    notes: String,
  },
  { timestamps: true },
);

export default mongoose.model('Vehicle', vehicleSchema);
