import Item from '../models/Item.js';
import {
  imageUtils,
  productImageUtils,
  IMAGE_CATEGORIES,
} from '../config/images.config.js';

class ShelfService {
  // Get user's shelf items with filtering and pagination
  async getUserShelfItems(userId, options = {}) {
    try {
      const { category, lowStock, page = 1, limit = 20, search } = options;
      const skip = (page - 1) * limit;

      const query = {
        ownerId: userId,
        available: true,
      };

      if (category) {
        query.category = category;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      let items = await Item.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('ownerId', 'name location rating totalTrades');

      // Add formatted image URLs to each item
      items = items.map((item) => this.formatItemWithImages(item));

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
      }).populate('ownerId', 'name location rating totalTrades phone');

      if (!item) return null;

      return this.formatItemWithImages(item);
    } catch (error) {
      console.error('Error in getShelfItemById:', error);
      throw error;
    }
  }

  // Add new item to shelf with images
  async addShelfItem(itemData, imageFiles = []) {
    try {
      // Process images if provided
      let processedImages = [];
      if (imageFiles && imageFiles.length > 0) {
        processedImages = await productImageUtils.saveProductImages(
          imageFiles,
          itemData.ownerId
        );
      }

      // Create item with image data
      const item = new Item({
        ...itemData,
        images: processedImages.map((img, index) => ({
          filename: img.filename,
          originalName: img.originalName,
          variants: img.variants,
          alt: `${itemData.name} - Image ${index + 1}`,
          isPrimary: index === 0, // First image is primary
          uploadedAt: new Date(),
        })),
      });

      await item.save();
      await item.populate('ownerId', 'name location rating');

      return this.formatItemWithImages(item);
    } catch (error) {
      console.error('Error in addShelfItem:', error);
      throw error;
    }
  }

  // Update shelf item with optional new images
  async updateShelfItem(itemId, userId, updateData, newImageFiles = []) {
    try {
      // Prevent updating sensitive fields
      delete updateData.ownerId;
      delete updateData._id;
      delete updateData.images; // Handle images separately

      const item = await Item.findOne({ _id: itemId, ownerId: userId });
      if (!item) return null;

      // Process new images if provided
      if (newImageFiles && newImageFiles.length > 0) {
        const processedImages = await productImageUtils.saveProductImages(
          newImageFiles,
          userId
        );

        // Add new images to existing ones
        const newImages = processedImages.map((img, index) => ({
          filename: img.filename,
          originalName: img.originalName,
          variants: img.variants,
          alt: `${updateData.name || item.name} - Image ${
            item.images.length + index + 1
          }`,
          isPrimary: item.images.length === 0 && index === 0, // First image is primary if no existing images
          uploadedAt: new Date(),
        }));

        updateData.images = [...item.images, ...newImages];
      }

      const updatedItem = await Item.findOneAndUpdate(
        { _id: itemId, ownerId: userId },
        updateData,
        { new: true, runValidators: true }
      ).populate('ownerId', 'name location rating');

      return this.formatItemWithImages(updatedItem);
    } catch (error) {
      console.error('Error in updateShelfItem:', error);
      throw error;
    }
  }

  // Remove specific image from item
  async removeItemImage(itemId, userId, imageId) {
    try {
      const item = await Item.findOne({ _id: itemId, ownerId: userId });
      if (!item) return null;

      // Remove image from array
      item.images = item.images.filter((img) => img._id.toString() !== imageId);

      // If removed image was primary, make first remaining image primary
      if (item.images.length > 0 && !item.images.some((img) => img.isPrimary)) {
        item.images[0].isPrimary = true;
      }

      await item.save();
      return this.formatItemWithImages(item);
    } catch (error) {
      console.error('Error in removeItemImage:', error);
      throw error;
    }
  }

  // Set primary image
  async setPrimaryImage(itemId, userId, imageId) {
    try {
      const item = await Item.findOne({ _id: itemId, ownerId: userId });
      if (!item) return null;

      // Set all images to not primary
      item.images.forEach((img) => {
        img.isPrimary = img._id.toString() === imageId;
      });

      await item.save();
      return this.formatItemWithImages(item);
    } catch (error) {
      console.error('Error in setPrimaryImage:', error);
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

  // Update item availability (mark as sold/available)
  async updateItemAvailability(itemId, userId, available, soldQuantity = 0) {
    try {
      const item = await Item.findOne({ _id: itemId, ownerId: userId });
      if (!item) return null;

      // If marking as sold, reduce quantity
      if (soldQuantity > 0) {
        if (soldQuantity > item.quantity) {
          throw new Error('Cannot sell more than available quantity');
        }
        item.quantity -= soldQuantity;
        item.available = item.quantity > 0;
      } else {
        item.available = available;
      }

      await item.save();
      return this.formatItemWithImages(item);
    } catch (error) {
      console.error('Error in updateItemAvailability:', error);
      throw error;
    }
  }

  // Bulk update quantities (for harvest updates)
  async bulkUpdateQuantities(userId, updates) {
    try {
      const results = [];

      for (const update of updates) {
        const item = await Item.findOneAndUpdate(
          { _id: update.itemId, ownerId: userId },
          {
            quantity: update.quantity,
            available: update.quantity > 0,
            lastUpdated: new Date(),
          },
          { new: true }
        );

        if (item) {
          results.push(this.formatItemWithImages(item));
        }
      }

      return results;
    } catch (error) {
      console.error('Error in bulkUpdateQuantities:', error);
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
            avgPrice: { $avg: '$price' },
          },
        },
      ]);

      // Recent activity (items added in last 30 days)
      const recentItems = await Item.countDocuments({
        ownerId: userId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      });

      return {
        totalItems,
        lowStockCount,
        expiringSoon,
        totalValue: totalValue[0]?.total || 0,
        categoryBreakdown,
        recentItems,
      };
    } catch (error) {
      console.error('Error in getShelfAnalytics:', error);
      throw error;
    }
  }

  // Helper method to format item with image URLs
  formatItemWithImages(item) {
    const itemObj = item.toObject();

    if (itemObj.images && itemObj.images.length > 0) {
      itemObj.images = itemObj.images.map((img) => ({
        id: img._id,
        filename: img.filename,
        originalName: img.originalName,
        alt: img.alt,
        isPrimary: img.isPrimary,
        uploadedAt: img.uploadedAt,
        urls: {
          thumbnail: imageUtils.getFullUrl(
            IMAGE_CATEGORIES.PRODUCT,
            imageUtils.getVariantFilename(img.filename, 'thumbnail')
          ),
          medium: imageUtils.getFullUrl(
            IMAGE_CATEGORIES.PRODUCT,
            imageUtils.getVariantFilename(img.filename, 'medium')
          ),
          large: imageUtils.getFullUrl(
            IMAGE_CATEGORIES.PRODUCT,
            imageUtils.getVariantFilename(img.filename, 'large')
          ),
          original: imageUtils.getFullUrl(
            IMAGE_CATEGORIES.PRODUCT,
            img.filename
          ),
        },
      }));

      // Set primary image for easy access
      itemObj.primaryImage =
        itemObj.images.find((img) => img.isPrimary) || itemObj.images[0];
    } else {
      itemObj.images = [];
      itemObj.primaryImage = null;
    }

    return itemObj;
  }

  // Get public marketplace items (for buyers to browse)
  async getMarketplaceItems(options = {}) {
    try {
      const {
        category,
        location,
        priceRange,
        page = 1,
        limit = 20,
        search,
        sortBy = 'createdAt',
      } = options;
      const skip = (page - 1) * limit;

      const query = { available: true };

      if (category) {
        query.category = category;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      if (priceRange) {
        query.price = {};
        if (priceRange.min) query.price.$gte = priceRange.min;
        if (priceRange.max) query.price.$lte = priceRange.max;
      }

      const sortOptions = {};
      switch (sortBy) {
        case 'price_low':
          sortOptions.price = 1;
          break;
        case 'price_high':
          sortOptions.price = -1;
          break;
        case 'newest':
          sortOptions.createdAt = -1;
          break;
        case 'rating':
          sortOptions['ownerId.rating'] = -1;
          break;
        default:
          sortOptions.createdAt = -1;
      }

      const items = await Item.find(query)
        .populate('ownerId', 'name location rating totalTrades')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      const formattedItems = items.map((item) =>
        this.formatItemWithImages(item)
      );

      const total = await Item.countDocuments(query);

      return {
        items: formattedItems,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error in getMarketplaceItems:', error);
      throw error;
    }
  }
}

export default new ShelfService();
