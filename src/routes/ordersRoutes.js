// routes/orderRoutes.js - Complete Order Routes
import express from 'express';
import orderService from '../services/orderService.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get user's orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, role, page, limit, search } = req.query;
    const options = { status, role, page, limit, search };

    const result = await orderService.getUserOrders(req.user.id, options);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get specific order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      buyerId: req.user.id,
    };

    const order = await orderService.createOrder(orderData);
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update order
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await orderService.updateOrder(
      req.params.id,
      req.user.id,
      req.body
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Cancel order
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const success = await orderService.cancelOrder(
      req.params.id,
      req.user.id,
      reason
    );

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or cannot be cancelled',
      });
    }

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Confirm delivery (by buyer)
router.patch('/:id/confirm-delivery', authMiddleware, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const order = await orderService.confirmDelivery(
      req.params.id,
      req.user.id,
      rating,
      review
    );

    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get seller analytics
router.get('/analytics/seller', authMiddleware, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const analytics = await orderService.getSellerOrderAnalytics(
      req.user.id,
      timeframe
    );
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get order statistics
router.get('/analytics/stats', authMiddleware, async (req, res) => {
  try {
    const { role = 'both' } = req.query;
    const stats = await orderService.getOrderStatistics(req.user.id, role);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate invoice
router.get('/:id/invoice', authMiddleware, async (req, res) => {
  try {
    const invoice = await orderService.generateInvoice(
      req.params.id,
      req.user.id
    );
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
