import express from 'express';
const router = express.Router();
import {
  getCurrentUserProfile,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  deleteAccount,
  getUserStats,
} from '../controllers/profileController.js';
import addressController from '../controllers/addressController.js';

// All profile routes require authentication (handled by app.js middleware)

// GET current user's profile
router.get('/', getCurrentUserProfile);

// GET user profile by ID (public with limited info)
router.get('/:userId', getUserProfile);

// PUT update current user's profile
router.put('/', updateUserProfile);

// POST upload profile avatar
router.post('/avatar', uploadAvatar);

// DELETE user account
router.delete('/', deleteAccount);

// GET user's trading statistics
router.get('/stats', getUserStats);

// Address management routes
router.get('/addresses', addressController.getUserAddresses);
router.post('/addresses', addressController.createAddress);
router.get('/addresses/:addressId', addressController.getAddress);
router.put('/addresses/:addressId', addressController.updateAddress);
router.delete('/addresses/:addressId', addressController.deleteAddress);

export default router;
