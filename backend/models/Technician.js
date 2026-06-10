import mongoose from 'mongoose';

const technicianSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
    },

    phone: String,

    designation: String,

    department: String,

    skills: [String],

    certifications: [String],

    hireDate: Date,

    address: String,

    emergencyContact: String,

    assignedTools: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tool',
      },
    ],

    assignedVehicles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
      },
    ],

    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Technician', technicianSchema);