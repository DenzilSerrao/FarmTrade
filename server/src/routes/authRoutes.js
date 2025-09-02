// Auth routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
import passport from 'passport';
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

// Debug: list exported keys from authController to confirm handlers exist
console.log(
  'authController exports:',
  authController && Object.keys(authController)
);

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
  authController.googleCallback
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
  authController.facebookCallback
);

module.exports = router;
