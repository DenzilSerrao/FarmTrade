const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// All profile routes require authentication (handled by app.js middleware)

// GET current user's profile
router.get('/', profileController.getCurrentUserProfile);

// GET user profile by ID (public with limited info)
router.get('/:userId', profileController.getUserProfile);

// PUT update current user's profile
router.put('/', profileController.updateUserProfile);

// POST upload profile avatar
router.post('/avatar', profileController.uploadAvatar);

// DELETE user account
router.delete('/', profileController.deleteAccount);

// GET user's trading statistics
router.get('/stats', profileController.getUserStats);

module.exports = router;