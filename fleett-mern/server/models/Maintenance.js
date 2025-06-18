const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    description: String,
    cost: Number,
    scheduledDate: { type: Date, required: true },
    completedDate: Date,
    status: { type: String, default: 'SCHEDULED' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);
