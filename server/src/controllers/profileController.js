// controllers/profileController.js

const express = require('express');
const router = express.Router();
const ProfileService = require('../services/profileService');

// Initialize service
const profileService = new ProfileService();

// GET user profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userProfile = await profileService.getUserProfile(userId);

    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PUT update user profile
router.put('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = req.body;

    if (userId !== user.id) {
      return res.status(400).json({ message: 'User ID mismatch' });
    }

    const updated = await profileService.updateUserProfile(user);

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
