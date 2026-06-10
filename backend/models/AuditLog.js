import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },

    module: {
      type: String,
      required: true,
    },

    recordId: String,

    oldData: mongoose.Schema.Types.Mixed,

    newData: mongoose.Schema.Types.Mixed,

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    ipAddress: String,

    userAgent: String,
  },
  { timestamps: true }
);

export default mongoose.model(
  'AuditLog',
  auditLogSchema
);