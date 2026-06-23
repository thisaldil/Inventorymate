import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    action: String,
    note: String,

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const toolSchema = new mongoose.Schema(
  {
    toolId: {
      type: String,
      unique: true,
      required: true,
    },

    toolName: {
      type: String,
      required: true,
    },

    toolType: String,

    category: String,

    brand: String,

    vehicleBrand: String,

    vehicleModel: String,

    serialNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    qrCode: String,

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },

    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician',
    },

    purchaseDate: Date,

    purchaseCost: Number,

    currentValue: Number,

    warrantyExpiry: Date,

    usageHours: Number,

    location: String,

    condition: {
      type: String,
      enum: ['New', 'Good', 'Fair', 'Damaged'],
      default: 'Good',
    },

    status: {
      type: String,
      enum: [
        'Available',
        'In Use',
        'Reserved',
        'Maintenance Required',
        'Out Of Service',
      ],
      default: 'Available',
    },

    notes: String,

    toolImage: String,

    history: [historySchema],
  },
  { timestamps: true }
);

export default mongoose.model('Tool', toolSchema);
