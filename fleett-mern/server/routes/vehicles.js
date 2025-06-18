const router = require('express').Router();
const Vehicle = require('../models/Vehicle');
const Rental = require('../models/Rental');
const Maintenance = require('../models/Maintenance');
const auth = require('../middleware/authMiddleware');

// GET all vehicles
router.get('/', async (req, res) => {
  res.json(await Vehicle.find());
});

// POST add vehicle (protected)
router.post('/', auth, async (req, res) => {
  try {
    const v = await Vehicle.create(req.body);
    res.json(v);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update vehicle
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE vehicle
router.delete('/:id', auth, async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET single vehicle details (with rentals & maintenance)
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const [rentals, maintenance] = await Promise.all([
      Rental.find({ vehicle: req.params.id }).populate('customer', 'name email').populate('vehicle'),
      Maintenance.find({ vehicle: req.params.id }),
    ]);

    res.json({ vehicle, rentals, maintenance });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET anomaly score
router.get('/:id/anomaly-score', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const agg = await Vehicle.aggregate([
      { $match: { category: vehicle.category } },
      { $group: { _id: null, avgPrice: { $avg: '$pricePerDay' } } },
    ]);

    const avg = agg[0]?.avgPrice || vehicle.pricePerDay;
    const score = avg ? vehicle.pricePerDay / avg : 1;
    res.json({ anomalyScore: score });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
