// services/profileService.js

const User = require('../models/User'); // Mongoose model or similar

class ProfileService {
  async getUserProfile(userId) {
    try {
      return await User.findById(userId);
    } catch (err) {
      console.error('Error in getUserProfile:', err);
      return null;
    }
  }

  async updateUserProfile(user) {
    try {
      const updated = await User.findByIdAndUpdate(user.id, user, {
        new: true,
      });
      return !!updated;
    } catch (err) {
      console.error('Error in updateUserProfile:', err);
      return false;
    }
  }
}

module.exports = ProfileService;
