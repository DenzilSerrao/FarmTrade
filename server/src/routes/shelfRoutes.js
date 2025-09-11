import express from 'express';
const router = express.Router();
import shelfController from '../controllers/shelfController.js';

// All shelf routes require authentication (handled by app.js middleware)

// GET user's shelf items
router.get('/items', shelfController.getShelfItems);

// GET specific shelf item
router.get('/items/:itemId', shelfController.getShelfItem);

// POST add new item to shelf
router.post('/items', shelfController.addShelfItem);

// PUT update shelf item (only if user owns it)
router.put('/items/:itemId', shelfController.updateShelfItem);

// DELETE remove item from shelf (only if user owns it)
router.delete('/items/:itemId', shelfController.deleteShelfItem);

// GET shelf analytics
router.get('/analytics', shelfController.getShelfAnalytics);

export default router;
