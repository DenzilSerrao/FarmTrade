const Item = require('../models/Item');

class ShelfService {
  async getShelfItems() {
    try {
      return await Item.find();
    } catch (err) {
      console.error('Error in getShelfItems:', err);
      return [];
    }
  }

  async addNewItem(newItem) {
    try {
      const item = new Item(newItem);
      return await item.save();
    } catch (err) {
      console.error('Error in addNewItem:', err);
      throw err;
    }
  }
}

module.exports = ShelfService;
