const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const User = require('../models/User');

// Verify JWT token middleware
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token required',
        error: 'MISSING_TOKEN'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Verify user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        message: 'User no longer exists',
        error: 'USER_NOT_FOUND'
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      verified: user.verified
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        error: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        error: 'INVALID_TOKEN'
      });
    }
    
    return res.status(500).json({ 
      message: 'Token verification failed',
      error: 'VERIFICATION_ERROR'
    });
  }
};

// Optional authentication middleware (for public endpoints that can benefit from user context)
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id);
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          verified: user.verified
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Admin verification middleware
exports.verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ 
        message: 'Admin access required',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({ 
      message: 'Admin verification failed',
      error: 'VERIFICATION_ERROR'
    });
  }
};

// Rate limiting middleware
exports.rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(clientId)) {
      requests.set(clientId, []);
    }
    
    const clientRequests = requests.get(clientId);
    const validRequests = clientRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        message: 'Too many requests',
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    validRequests.push(now);
    requests.set(clientId, validRequests);
    
    next();
  };
};