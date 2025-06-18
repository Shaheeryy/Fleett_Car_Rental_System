const router = require('express').Router();
const Rental = require('../models/Rental');
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/authMiddleware');

const ymKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

router.get('/monthly-revenue', auth, async (req, res) => {
  const rentals = await Rental.find({ totalCost: { $gt: 0 } });
  const map = {};
  rentals.forEach((r) => {
    const key = ymKey(r.updatedAt || r.createdAt);
    map[key] = (map[key] || 0) + (r.totalCost || 0);
  });
  res.json(map);
});

router.get('/monthly-maintenance-cost', auth, async (req, res) => {
  const maint = await Maintenance.find({ cost: { $gt: 0 } });
  const map = {};
  maint.forEach((m) => {
    const key = ymKey(m.updatedAt || m.createdAt);
    map[key] = (map[key] || 0) + (m.cost || 0);
  });
  res.json(map);
});

router.get('/vehicle-category-distribution', async (req, res) => {
  const data = await Vehicle.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const result = Object.fromEntries(data.map((d) => [d._id || 'UNKNOWN', d.count]));
  res.json(result);
});

router.get('/vehicle-status-distribution', async (req, res) => {
  const data = await Vehicle.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const result = Object.fromEntries(data.map((d) => [d._id || 'UNKNOWN', d.count]));
  res.json(result);
});

router.get('/total-revenue', auth, async (req, res) => {
  const total = await Rental.aggregate([
    { $group: { _id: null, total: { $sum: { $ifNull: ['$totalCost', 0] } } } },
  ]);
  res.json(total[0]?.total || 0);
});

router.get('/most-least-rented-model', async (req, res) => {
  const data = await Rental.aggregate([
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicle',
        foreignField: '_id',
        as: 'vehicleDoc',
      },
    },
    { $unwind: '$vehicleDoc' },
    { $group: { _id: '$vehicleDoc.model', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  if (data.length === 0) return res.json({});
  const most = data[0];
  const least = data[data.length - 1];
  res.json({ most, least });
});

router.get('/rental-count-per-vehicle', async (req, res) => {
  const data = await Rental.aggregate([
    { $group: { _id: '$vehicle', count: { $sum: 1 } } },
  ]);
  const result = Object.fromEntries(data.map((d) => [d._id.toString(), d.count]));
  res.json(result);
});

module.exports = router;
