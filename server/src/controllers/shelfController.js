const express = require('express');
const router = express.Router();
const ShelfService = require('../services/shelfService');

const shelfService = new ShelfService();

// GET all shelf items
router.get('/items', async (req, res) => {
  try {
    const items = await shelfService.getShelfItems();
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching shelf items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST add a new item
router.post('/add', async (req, res) => {
  try {
    const newItem = req.body;

    if (!newItem) {
      return res.status(400).json({ message: 'Item cannot be null.' });
    }

    const createdItem = await shelfService.addNewItem(newItem);
    res.status(201).json(createdItem);
  } catch (error) {
    console.error('Error adding new item:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
