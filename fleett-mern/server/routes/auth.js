const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ token, username: user.username, role: user.role, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) throw new Error('Invalid credentials');
    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ token, username: user.username, role: user.role, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
