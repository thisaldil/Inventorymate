import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        'INFO',
        'SUCCESS',
        'WARNING',
        'ERROR'
      ],
      default: 'INFO',
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    relatedModule: String,

    relatedRecordId: String,
  },
  { timestamps: true }
);

export default mongoose.model(
  'Notification',
  notificationSchema
);