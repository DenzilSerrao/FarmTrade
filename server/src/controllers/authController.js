const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/auth.config');
const User = require('../models/User');
const { rateLimiter } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply rate limiting to auth routes
router.use(rateLimiter(10, 15 * 60 * 1000)); // 10 requests per 15 minutes

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      verified: user.verified 
    },
    config.jwt.secret,
    { expiresIn: '24h' }
  );
};

// ✅ Google Login (redirect to Google)
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

// ✅ Google Callback (exchange code → user → JWT)
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
  async (req, res) => {
    try {
      const token = generateToken(req.user);
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&provider=google`);
    } catch (err) {
      console.error('Google OAuth callback error:', err);
      res.redirect('/login?error=auth_failed');
    }
  }
);

// ✅ Facebook Login (redirect to Facebook)
router.get(
  '/facebook',
  passport.authenticate('facebook', { 
    scope: ['email'],
    display: 'popup'
  })
);

// ✅ Facebook Callback
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login?error=oauth_failed' }),
  async (req, res) => {
    try {
      const token = generateToken(req.user);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&provider=facebook`);
    } catch (err) {
      console.error('Facebook OAuth callback error:', err);
      res.redirect('/login?error=auth_failed');
    }
  }
);

// ✅ Register user manually (email/password)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Name, email and password are required',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long',
        error: 'WEAK_PASSWORD'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'User already exists with this email',
        error: 'USER_EXISTS'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({ 
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim(),
      location: location?.trim(),
      authProvider: 'local',
      verified: false,
      joinDate: new Date().toISOString()
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({ 
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        location: newUser.location,
        verified: newUser.verified,
        joinDate: newUser.joinDate
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      message: 'Registration failed',
      error: 'INTERNAL_ERROR'
    });
  }
});

// ✅ Local login (email/password + JWT)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required',
        error: 'MISSING_CREDENTIALS'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        verified: user.verified,
        rating: user.rating,
        joinDate: user.joinDate,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Login failed',
      error: 'INTERNAL_ERROR'
    });
  }
});

// ✅ Token verification endpoint
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        message: 'Token is required',
        error: 'MISSING_TOKEN'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified
      }
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        valid: false,
        message: 'Token expired',
        error: 'TOKEN_EXPIRED'
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        valid: false,
        message: 'Invalid token',
        error: 'INVALID_TOKEN'
      });
    }

    console.error('Token verification error:', err);
    res.status(500).json({ 
      valid: false,
      message: 'Verification failed',
      error: 'VERIFICATION_ERROR'
    });
  }
});

// ✅ Logout endpoint
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ 
        message: 'Logout failed',
        error: 'LOGOUT_ERROR'
      });
    }
    
    res.status(200).json({ message: 'Logout successful' });
  });
});

// ✅ Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        message: 'Token is required',
        error: 'MISSING_TOKEN'
      });
    }

    // Verify the old token (even if expired)
    const decoded = jwt.verify(token, config.jwt.secret, { ignoreExpiration: true });
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Generate new token
    const newToken = generateToken(user);

    res.status(200).json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(401).json({ 
      message: 'Token refresh failed',
      error: 'REFRESH_FAILED'
    });
  }
});

module.exports = router;