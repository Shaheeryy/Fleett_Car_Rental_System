const router = require('express').Router();
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const Rental = require('../models/Rental');
const Maintenance = require('../models/Maintenance');
const auth = require('../middleware/authMiddleware');

/**
 * GET /api/admin/dashboard/metrics
 * Returns counts for dashboard widgets
 */
router.get('/metrics', auth, async (req, res) => {
  try {
    const [totalVehicles, totalCustomers, activeRentals, vehiclesUnderMaintenance] = await Promise.all([
      Vehicle.countDocuments(),
      Customer.countDocuments(),
      Rental.countDocuments({ status: 'ACTIVE' }),
      Vehicle.countDocuments({ status: 'UNDER_MAINTENANCE' }),
    ]);

    res.json({
      totalVehicles,
      totalCustomers,
      activeRentals,
      vehiclesUnderMaintenance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/admin/dashboard/financial
 * Returns aggregated revenue / maintenance cost & net profit
 */
router.get('/financial', auth, async (req, res) => {
  try {
    const [revenueAgg, maintenanceAgg] = await Promise.all([
      Rental.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$totalCost', 0] } } } }]),
      Maintenance.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$cost', 0] } } } }]),
    ]);

    const revenue = revenueAgg[0]?.total || 0;
    const maintenanceCost = maintenanceAgg[0]?.total || 0;
    const netProfit = revenue - maintenanceCost;

    res.json({ revenue, maintenanceCost, netProfit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/admin/dashboard/recent-activity
 * Returns the 5 most recent significant activities (rentals, maintenance,
 * customers and vehicles) combined.
 */
router.get('/recent-activity', auth, async (req, res) => {
  try {
    const [recentRentals, recentMaintenance, recentCustomers, recentVehicles] = await Promise.all([
      Rental.find().sort({ updatedAt: -1 }).limit(5).populate('vehicle customer'),
      Maintenance.find().sort({ updatedAt: -1 }).limit(5).populate('vehicle'),
      Customer.find().sort({ updatedAt: -1 }).limit(5),
      Vehicle.find().sort({ updatedAt: -1 }).limit(5),
    ]);

    // ---- Map each collection into a unified activity object ----
    const rentalActivities = recentRentals.map((r) => ({
      type: 'RENTAL',
      id: r._id,
      date: r.updatedAt || r.createdAt,
      status: r.status,
      vehicle: r.vehicle,
      customer: r.customer,
    }));

    const maintenanceActivities = recentMaintenance.map((m) => ({
      type: 'MAINTENANCE',
      id: m._id,
      date: m.updatedAt || m.createdAt,
      status: m.status,
      vehicle: m.vehicle,
    }));

    const customerActivities = recentCustomers.map((c) => ({
      type: 'CUSTOMER',
      id: c._id,
      date: c.updatedAt || c.createdAt,
      name: c.name,
      email: c.email,
    }));

    const vehicleActivities = recentVehicles.map((v) => ({
      type: 'VEHICLE',
      id: v._id,
      date: v.updatedAt || v.createdAt,
      make: v.make,
      model: v.model,
      status: v.status,
    }));

    // Merge, sort by date desc and return top 5
    const merged = [...rentalActivities, ...maintenanceActivities, ...customerActivities, ...vehicleActivities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json(merged);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
