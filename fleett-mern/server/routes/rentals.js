const router = require('express').Router();
const Rental = require('../models/Rental');
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

router.get('/', auth, async (req, res) => {
  res.json(await Rental.find().populate('customer vehicle'));
});

router.get('/customer/:customerId', auth, async (req, res) => {
  try {
    const rentals = await Rental.find({ customer: req.params.customerId })
      .populate('customer vehicle');
    res.json(rentals);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/rent', auth, async (req, res) => {
  const { vehicleId, customerId, rentalDate, returnDate, totalCost } = req.body;

  // --- Cascade Debug Logging ---
  console.log('[Cascade] Received raw rentalDate:', rentalDate);
  console.log('[Cascade] Received raw returnDate:', returnDate);
  try {
    const parsedRentalDate = new Date(rentalDate);
    const parsedReturnDate = new Date(returnDate);
    console.log('[Cascade] Parsed rentalDate to ISO:', parsedRentalDate.toISOString());
    console.log('[Cascade] Parsed returnDate to ISO:', parsedReturnDate.toISOString());
  } catch (e) {
    console.error('[Cascade] Error parsing dates:', e);
  }
  // --- End Cascade Debug Logging ---
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');
    if (vehicle.status === 'RENTED') throw new Error('Vehicle already rented');
    vehicle.status = 'RENTED';
    await vehicle.save({ session });

    const rental = await Rental.create([
      {
        vehicle: vehicleId,
        customer: customerId,
        rentalDate,
        returnDate,
        totalCost,
        status: 'ACTIVE',
      },
    ], { session });

    await session.commitTransaction();
    res.json(rental[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/return/:id', auth, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('vehicle');
    if (!rental) throw new Error('Rental not found');
    rental.status = 'RETURNED';
    rental.vehicle.status = 'AVAILABLE';
    await rental.vehicle.save();
    await rental.save();
    res.json(rental);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cancel
router.delete('/cancel/:id', auth, async (req, res) => {
  try {
    const rental = await Rental.findByIdAndDelete(req.params.id);
    if (!rental) throw new Error('Rental not found');
    await Vehicle.findByIdAndUpdate(rental.vehicle, { status: 'AVAILABLE' });
    res.json({ message: 'Rental cancelled' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
