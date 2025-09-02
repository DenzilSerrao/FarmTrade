const User = require('../models/User');
const Order = require('../models/Order');
const Item = require('../models/Item');

class ProfileService {
  // Get full user profile (for authenticated user)
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (err) {
      console.error('Error in getUserProfile:', err);
      throw err;
    }
  }

  // Get public user profile (limited info for other users)
  async getPublicUserProfile(userId, requestingUserId) {
    try {
      const user = await User.findById(userId).select(
        'name location rating totalTrades verified joinDate avatar'
      );
      
      if (!user) {
        return null;
      }

      // Add additional info if requesting own profile
      if (requestingUserId && userId === requestingUserId) {
        return await User.findById(userId);
      }

      return user;
    } catch (err) {
      console.error('Error in getPublicUserProfile:', err);
      throw err;
    }
  }

  // Update user profile
  async updateUserProfile(userId, updateData) {
    try {
      // Sanitize update data - remove sensitive fields
      const allowedFields = [
        'name', 'phone', 'location', 'avatar'
      ];
      
      const sanitizedData = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          sanitizedData[field] = updateData[field];
        }
      });

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        sanitizedData,
        { new: true, runValidators: true }
      );

      return updatedUser;
    } catch (err) {
      console.error('Error in updateUserProfile:', err);
      throw err;
    }
  }

  // Update user avatar
  async updateAvatar(userId, avatarUrl) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { avatar: avatarUrl },
        { new: true }
      );

      return updatedUser;
    } catch (err) {
      console.error('Error in updateAvatar:', err);
      throw err;
    }
  }

  // Delete user account
  async deleteUserAccount(userId) {
    try {
      // Check for active orders
      const activeOrders = await Order.countDocuments({
        $or: [
          { buyerId: userId },
          { sellerId: userId }
        ],
        status: { $in: ['pending', 'accepted', 'shipped'] }
      });

      if (activeOrders > 0) {
        throw new Error('Cannot delete account with active orders');
      }

      // Soft delete - mark as inactive instead of hard delete
      await User.findByIdAndUpdate(userId, { 
        isActive: false,
        email: `deleted_${Date.now()}_${userId}@deleted.com`
      });

      // Mark user's items as unavailable
      await Item.updateMany(
        { ownerId: userId },
        { available: false }
      );

      return true;
    } catch (err) {
      console.error('Error in deleteUserAccount:', err);
      throw err;
    }
  }

  // Get user trading statistics
  async getUserTradingStats(userId) {
    try {
      const user = await User.findById(userId);
      
      const orderStats = await Order.aggregate([
        {
          $match: {
            $or: [
              { buyerId: userId },
              { sellerId: userId }
            ]
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$totalPrice' }
          }
        }
      ]);

      const totalOrders = await Order.countDocuments({
        $or: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      });

      const totalSales = await Order.countDocuments({
        sellerId: userId,
        status: 'delivered'
      });

      const totalPurchases = await Order.countDocuments({
        buyerId: userId,
        status: 'delivered'
      });

      const averageRating = await Order.aggregate([
        {
          $match: {
            sellerId: userId,
            rating: { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' }
          }
        }
      ]);

      return {
        user: {
          name: user.name,
          rating: user.rating,
          totalTrades: user.totalTrades,
          verified: user.verified,
          joinDate: user.joinDate
        },
        orders: {
          total: totalOrders,
          sales: totalSales,
          purchases: totalPurchases,
          byStatus: orderStats
        },
        rating: {
          average: averageRating[0]?.avgRating || 0,
          total: await Order.countDocuments({
            sellerId: userId,
            rating: { $exists: true }
          })
        }
      };
    } catch (err) {
      console.error('Error in getUserTradingStats:', err);
      throw err;
    }
  }
}

module.exports = ProfileService;