import express from 'express';
const router = express.Router();
import profileController from '../controllers/profileController.js';

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

export default router;
