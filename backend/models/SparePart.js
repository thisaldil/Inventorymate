import mongoose from 'mongoose';

const compatibleVehicleSchema = new mongoose.Schema(
  {
    make: String,
    model: String,
    yearFrom: Number,
    yearTo: Number,
  },
  { _id: false }
);

const sparePartSchema = new mongoose.Schema(
  {
    partNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    partName: {
      type: String,
      required: true,
    },

    description: String,

    category: {
      type: String,
      required: true,
    },

    subCategory: String,

    brand: String,

    vehicleBrand: String,

    vehicleModel: String,

    oemNumber: String,

    barcode: String,

    compatibleVehicles: [compatibleVehicleSchema],

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },

    rackLocation: String,

    binLocation: String,

    quantity: {
      type: Number,
      default: 0,
    },

    reservedQuantity: {
      type: Number,
      default: 0,
    },

    reorderLevel: {
      type: Number,
      default: 0,
    },

    minimumQuantity: {
      type: Number,
      default: 0,
    },

    unitCost: {
      type: Number,
      default: 0,
    },

    sellingPrice: {
      type: Number,
      default: 0,
    },

    purchaseDate: Date,

    lastRestockedDate: Date,

    warrantyPeriod: String,

    partCondition: {
      type: String,
      enum: ['New', 'Used', 'Refurbished'],
      default: 'New',
    },

    image: String,

    notes: String,

    status: {
      type: String,
      enum: [
        'In Stock',
        'Low Stock',
        'On Order',
        'Out Of Stock',
      ],
      default: 'In Stock',
    },
  },
  { timestamps: true }
);

export default mongoose.model('SparePart', sparePartSchema);
