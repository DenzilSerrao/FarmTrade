import Item from '../models/Item.js';

class ShelfService {
  // Get user's shelf items with filtering and pagination
  async getUserShelfItems(userId, options = {}) {
    try {
      const { category, lowStock, page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      const query = {
        ownerId: userId,
        available: true,
      };

      if (category) {
        query.category = category;
      }

      let items = await Item.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Filter by low stock if requested
      if (lowStock) {
        items = items.filter((item) => item.lowStock);
      }

      const total = await Item.countDocuments(query);

      return {
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error in getUserShelfItems:', error);
      throw error;
    }
  }

  // Get specific shelf item by ID
  async getShelfItemById(itemId, userId) {
    try {
      const item = await Item.findOne({
        _id: itemId,
        ownerId: userId,
      }).populate('ownerId', 'name location rating');

      return item;
    } catch (error) {
      console.error('Error in getShelfItemById:', error);
      throw error;
    }
  }

  // Add new item to shelf
  async addShelfItem(itemData) {
    try {
      const item = new Item(itemData);
      await item.save();

      await item.populate('ownerId', 'name location rating');
      return item;
    } catch (error) {
      console.error('Error in addShelfItem:', error);
      throw error;
    }
  }

  // Update shelf item
  async updateShelfItem(itemId, userId, updateData) {
    try {
      // Prevent updating sensitive fields
      delete updateData.ownerId;
      delete updateData._id;

      const updatedItem = await Item.findOneAndUpdate(
        { _id: itemId, ownerId: userId },
        updateData,
        { new: true, runValidators: true }
      ).populate('ownerId', 'name location rating');

      return updatedItem;
    } catch (error) {
      console.error('Error in updateShelfItem:', error);
      throw error;
    }
  }

  // Delete shelf item
  async deleteShelfItem(itemId, userId) {
    try {
      const result = await Item.findOneAndDelete({
        _id: itemId,
        ownerId: userId,
      });

      return !!result;
    } catch (error) {
      console.error('Error in deleteShelfItem:', error);
      throw error;
    }
  }

  // Get shelf analytics for user
  async getShelfAnalytics(userId) {
    try {
      const totalItems = await Item.countDocuments({
        ownerId: userId,
        available: true,
      });

      const lowStockItems = await Item.find({
        ownerId: userId,
        available: true,
      });

      const lowStockCount = lowStockItems.filter(
        (item) => item.lowStock
      ).length;

      const expiringSoon = await Item.countDocuments({
        ownerId: userId,
        available: true,
        expiryDate: {
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      });

      const totalValue = await Item.aggregate([
        { $match: { ownerId: userId, available: true } },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$quantity', '$price'] } },
          },
        },
      ]);

      const categoryBreakdown = await Item.aggregate([
        { $match: { ownerId: userId, available: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            value: { $sum: { $multiply: ['$quantity', '$price'] } },
          },
        },
      ]);

      return {
        totalItems,
        lowStockCount,
        expiringSoon,
        totalValue: totalValue[0]?.total || 0,
        categoryBreakdown,
      };
    } catch (error) {
      console.error('Error in getShelfAnalytics:', error);
      throw error;
    }
  }
}

export default new ShelfService();
