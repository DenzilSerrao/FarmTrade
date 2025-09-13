// Auth routes
import express from 'express';
const router = express.Router();
import passport from 'passport';
import {
  login,
  register,
  logout,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  googleCallback,
  facebookCallback,
} from '../controllers/authController.js';
import { rateLimiter } from '../middlewares/auth.middleware.js';

// Apply rate limiting to auth routes (10 requests per 15 minutes)
router.use(rateLimiter(10, 15 * 60 * 1000));

// const jwt = require('jsonwebtoken');
// const config = require('../config/auth.config');

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);

// Google OAuth start (redirects user to Google)
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login?error=oauth_failed',
  }),
  googleCallback
);

// Facebook OAuth start (redirects user to Facebook)
router.get(
  '/facebook',
  passport.authenticate('facebook', {
    scope: ['email'],
    display: 'popup',
  })
);

// Facebook OAuth callback
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login?error=oauth_failed',
  }),
  facebookCallback
);

export default router;
