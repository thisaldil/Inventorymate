import mongoose from 'mongoose';

const purchaseItemSchema = new mongoose.Schema(
  {
    sparePart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SparePart',
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    unitCost: {
      type: Number,
      required: true,
    },

    total: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      unique: true,
      required: true,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },

    items: [purchaseItemSchema],

    subtotal: Number,

    taxAmount: Number,

    discountAmount: Number,

    totalAmount: Number,

    expectedDeliveryDate: Date,

    deliveredDate: Date,

    status: {
      type: String,
      enum: [
        'Draft',
        'Pending',
        'Approved',
        'Ordered',
        'Partially Received',
        'Received',
        'Cancelled'
      ],
      default: 'Draft',
    },

    remarks: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  'PurchaseOrder',
  purchaseOrderSchema
);