const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    make: String,
    model: String,
    year: Number,
    category: String,
    status: String,
    registrationNumber: String,
    pricePerDay: Number,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Add a virtual field `vehicleId` that mirrors the document's `_id` so the frontend can
// consistently reference `vehicleId` instead of `_id`.
vehicleSchema.virtual('vehicleId').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
