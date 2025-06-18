const router = require('express').Router();
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/authMiddleware');

// GET all maintenance records
router.get('/', auth, async (req, res) => {
  res.json(await Maintenance.find().populate('vehicle'));
});

// Schedule maintenance
router.post('/schedule/:vehicleId', auth, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');

    vehicle.status = 'MAINTENANCE';
    await vehicle.save();

    const maintenance = await Maintenance.create({
      vehicle: vehicleId,
      ...req.body,
      status: 'SCHEDULED',
    });

    res.json(maintenance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update maintenance (mark as completed)
router.put('/update/:id', auth, async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id).populate('vehicle');
    if (!maintenance) throw new Error('Maintenance not found');
    maintenance.status = 'COMPLETED';
    Object.assign(maintenance, req.body);
    await maintenance.save();

    // set vehicle back to available
    if (maintenance.vehicle) {
      maintenance.vehicle.status = 'AVAILABLE';
      await maintenance.vehicle.save();
    }

    res.json(maintenance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Delete maintenance record
router.delete('/:id', auth, async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) return res.status(404).json({ message: 'Maintenance not found' });

    // reset vehicle status if linked
    if (maintenance.vehicle) {
      const vehicle = await Vehicle.findById(maintenance.vehicle);
      if (vehicle) {
        vehicle.status = 'AVAILABLE';
        await vehicle.save();
      }
    }

    await maintenance.deleteOne();
    res.json({ message: 'Maintenance deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
