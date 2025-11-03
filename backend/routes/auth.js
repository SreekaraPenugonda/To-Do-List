// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // used as fallback if no comparePassword
const User = require('../models/User');

const router = express.Router();

// Helper: create JWT
const createToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set in environment');
  // expiresIn can be adjusted as needed
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // If your User model hashes password in pre-save hook, this is fine.
    // Otherwise you can hash here: const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password });
    await user.save();

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('POST /api/auth/register error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Prefer model's comparePassword if implemented, otherwise use bcrypt
    let isMatch = false;
    if (typeof user.comparePassword === 'function') {
      // many user models implement comparePassword and already handle hashing
      isMatch = await user.comparePassword(password);
    } else if (user.password) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // create token payload - include minimal info: id and email
    const token = createToken({ id: user._id, email: user.email });

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('POST /api/auth/login error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;
