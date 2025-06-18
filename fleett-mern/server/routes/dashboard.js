const router = require('express').Router();
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const Rental = require('../models/Rental');
const Maintenance = require('../models/Maintenance');
const auth = require('../middleware/authMiddleware');

// /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalVehicles, totalCustomers, activeRentals, underMaint] = await Promise.all([
      Vehicle.countDocuments(),
      Customer.countDocuments(),
      Rental.countDocuments({ status: 'ACTIVE' }),
      Vehicle.countDocuments({ status: 'UNDER_MAINTENANCE' }),
    ]);

    res.json({
      totalVehicles,
      totalCustomers,
      rentedVehicles: activeRentals,
      underMaintenanceVehicles: underMaint,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// /api/dashboard/revenue-and-cost
router.get('/revenue-and-cost', auth, async (req, res) => {
  try {
    const [revenueAgg, maintAgg] = await Promise.all([
      Rental.aggregate([{ $group: { _id: null, revenue: { $sum: { $ifNull: ['$totalCost', 0] } } } }]),
      Maintenance.aggregate([{ $group: { _id: null, cost: { $sum: { $ifNull: ['$cost', 0] } } } }]),
    ]);

    const revenue = revenueAgg[0]?.revenue || 0;
    const maintenanceCost = maintAgg[0]?.cost || 0;
    res.json({ revenue, maintenanceCost });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
