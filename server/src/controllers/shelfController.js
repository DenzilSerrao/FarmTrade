import express from 'express';
const router = express.Router();
import ShelfService from '../services/shelfService';

const shelfService = new ShelfService();

// GET user's shelf items
exports.getShelfItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, lowStock, page = 1, limit = 20 } = req.query;

    const items = await shelfService.getUserShelfItems(userId, {
      category,
      lowStock: lowStock === 'true',
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching shelf items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shelf items',
      error: 'FETCH_SHELF_ERROR',
    });
  }
};

// GET specific shelf item
exports.getShelfItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const item = await shelfService.getShelfItemById(itemId, userId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Shelf item not found',
        error: 'ITEM_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Error fetching shelf item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shelf item',
      error: 'FETCH_ITEM_ERROR',
    });
  }
};

// POST add new item to shelf
exports.addShelfItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemData = {
      ...req.body,
      ownerId: userId,
    };

    // Validation
    if (!itemData.name || !itemData.quantity || !itemData.price) {
      return res.status(400).json({
        success: false,
        message: 'Name, quantity, and price are required',
        error: 'MISSING_REQUIRED_FIELDS',
      });
    }

    const createdItem = await shelfService.addShelfItem(itemData);

    res.status(201).json({
      success: true,
      message: 'Item added to shelf successfully',
      data: createdItem,
    });
  } catch (error) {
    console.error('Error adding shelf item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to shelf',
      error: 'ADD_ITEM_ERROR',
    });
  }
};

// PUT update shelf item
exports.updateShelfItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const updatedItem = await shelfService.updateShelfItem(
      itemId,
      userId,
      updateData
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Shelf item not found or access denied',
        error: 'ITEM_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    console.error('Error updating shelf item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: 'UPDATE_ITEM_ERROR',
    });
  }
};

// DELETE remove item from shelf
exports.deleteShelfItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const deleted = await shelfService.deleteShelfItem(itemId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Shelf item not found or access denied',
        error: 'ITEM_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item removed from shelf successfully',
    });
  } catch (error) {
    console.error('Error deleting shelf item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: 'DELETE_ITEM_ERROR',
    });
  }
};

// GET shelf analytics
exports.getShelfAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const analytics = await shelfService.getShelfAnalytics(userId);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error fetching shelf analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shelf analytics',
      error: 'FETCH_ANALYTICS_ERROR',
    });
  }
};

export default shelfController;
