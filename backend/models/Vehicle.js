import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      unique: true,
      required: true,
    },

    make: {
      type: String,
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    year: Number,

    vehicleType: {
      type: String,
      enum: [
        'Car',
        'SUV',
        'Van',
        'Truck',
        'Bus',
        'Motorcycle',
      ],
    },

    vinNumber: {
      type: String,
      unique: true,
    },

    chassisNumber: {
      type: String,
      unique: true,
    },

    engineNumber: String,

    registrationNumber: {
      type: String,
      unique: true,
    },

    fuelType: String,

    transmission: String,

    mileage: Number,

    color: String,

    purchasePrice: Number,

    sellingPrice: Number,

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },

    insuranceExpiry: Date,

    licenseExpiry: Date,

    lastServiceDate: Date,

    nextServiceDate: Date,

    condition: {
      type: String,
      enum: [
        'Excellent',
        'Good',
        'Fair',
        'Damaged',
      ],
      default: 'Good',
    },

    status: {
      type: String,
      enum: [
        'Available',
        'Reserved',
        'Under Repair',
        'Sold',
      ],
      default: 'Available',
    },

    images: [String],

    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Vehicle', vehicleSchema);