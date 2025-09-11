import express from 'express';
const router = express.Router();
import {
  getShelfItems,
  getShelfItem,
  addShelfItem,
  updateShelfItem,
  deleteShelfItem,
  getShelfAnalytics,
} from '../controllers/shelfController.js';

// All shelf routes require authentication (handled by app.js middleware)

// GET user's shelf items
router.get('/items', getShelfItems);

// GET specific shelf item
router.get('/items/:itemId', getShelfItem);

// POST add new item to shelf
router.post('/items', addShelfItem);

// PUT update shelf item (only if user owns it)
router.put('/items/:itemId', updateShelfItem);

// DELETE remove item from shelf (only if user owns it)
router.delete('/items/:itemId', deleteShelfItem);

// GET shelf analytics
router.get('/analytics', getShelfAnalytics);

export default router;
