import ShelfService from '../services/shelfService.js';

// GET user's shelf items
export const getShelfItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, lowStock, page = 1, limit = 20 } = req.query;

    const items = await ShelfService.getUserShelfItems(userId, {
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
export const getShelfItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const item = await ShelfService.getShelfItemById(itemId, userId);

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
export const addShelfItem = async (req, res) => {
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

    const createdItem = await ShelfService.addShelfItem(itemData);

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
export const updateShelfItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const updatedItem = await ShelfService.updateShelfItem(
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
export const deleteShelfItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const deleted = await ShelfService.deleteShelfItem(itemId, userId);

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
export const getShelfAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const analytics = await ShelfService.getShelfAnalytics(userId);

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

const shelfController = {
  getShelfItems,
  getShelfItem,
  addShelfItem,
  updateShelfItem,
  deleteShelfItem,
  getShelfAnalytics,
};

export default shelfController;
