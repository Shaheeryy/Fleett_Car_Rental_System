const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    rentalDate: { type: Date, required: true },
    returnDate: Date,
    totalCost: Number,
    status: { type: String, default: 'ACTIVE' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Add a virtual field `rentalId` that mirrors the document's `_id` so the frontend can
// consistently reference `rentalId` instead of `_id`.
rentalSchema.virtual('rentalId').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('Rental', rentalSchema);
