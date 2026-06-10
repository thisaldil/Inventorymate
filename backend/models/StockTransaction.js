import mongoose from 'mongoose';

const stockTransactionSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
    },

    sparePart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SparePart',
      required: true,
    },

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },

    transactionType: {
      type: String,
      enum: [
        'IN',
        'OUT',
        'TRANSFER_IN',
        'TRANSFER_OUT',
        'ADJUSTMENT',
        'RESERVED',
        'RELEASED'
      ],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    balanceAfter: {
      type: Number,
      required: true,
    },

    unitCost: Number,

    referenceNumber: String,

    notes: String,

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  'StockTransaction',
  stockTransactionSchema
);