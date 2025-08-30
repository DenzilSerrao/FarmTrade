const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const User = require('../models/User');

const router = express.Router();

// ✅ Google Login (redirect to Google)
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ✅ Google Callback (exchange code → user → JWT)
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Generate JWT for the authenticated user
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      // You can redirect with token or send as JSON
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
        },
      });
    } catch (err) {
      console.error('Auth error:', err);
      res.status(500).json({ message: 'Authentication failed' });
    }
  }
);

// ✅ Register user manually (for email/password flow)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ name, email, password }); // hash password in model or service
    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// ✅ Local login (email/password + JWT)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
