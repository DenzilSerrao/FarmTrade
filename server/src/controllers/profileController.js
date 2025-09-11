import express from 'express';
const router = express.Router();
import ProfileService from '../services/profileService';
import User from '../models/User';

const profileService = new ProfileService();

// GET current user's profile
exports.getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userProfile = await profileService.getUserProfile(userId);

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
        error: 'PROFILE_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: 'FETCH_PROFILE_ERROR',
    });
  }
};

// GET user profile by ID (public with limited info)
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;

    const userProfile = await profileService.getPublicUserProfile(
      userId,
      requestingUserId
    );

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: 'FETCH_USER_ERROR',
    });
  }
};

// PUT update current user's profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Prevent updating sensitive fields
    delete updateData.id;
    delete updateData._id;
    delete updateData.password;
    delete updateData.googleId;
    delete updateData.facebookId;
    delete updateData.isAdmin;
    delete updateData.verified;

    const updatedProfile = await profileService.updateUserProfile(
      userId,
      updateData
    );

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile update failed',
        error: 'UPDATE_FAILED',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: 'UPDATE_PROFILE_ERROR',
    });
  }
};

// POST upload profile avatar
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: 'Avatar data is required',
        error: 'MISSING_AVATAR',
      });
    }

    const updatedUser = await profileService.updateAvatar(userId, avatar);

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: { avatar: updatedUser.avatar },
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: 'UPLOAD_AVATAR_ERROR',
    });
  }
};

// DELETE user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Verify password for account deletion
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
    }

    // For OAuth users, skip password check
    if (user.authProvider === 'local') {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required for account deletion',
          error: 'PASSWORD_REQUIRED',
        });
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password',
          error: 'INVALID_PASSWORD',
        });
      }
    }

    await profileService.deleteUserAccount(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: 'DELETE_ACCOUNT_ERROR',
    });
  }
};

// GET user's trading statistics
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await profileService.getUserTradingStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: 'FETCH_STATS_ERROR',
    });
  }
};

export default profileController;
