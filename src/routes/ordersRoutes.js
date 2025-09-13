import express from 'express';
const router = express.Router();
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  getOrderInvoice,
} from '../controllers/ordersController.js';

// All order routes require authentication (handled by app.js middleware)

// GET user's orders
router.get('/', getOrders);

// GET specific order by ID
router.get('/:orderId', getOrderById);

// POST create new order
router.post('/', createOrder);

// PUT update order (only if user owns it or is admin)
router.put('/:orderId', updateOrder);

// DELETE cancel order (only if user owns it)
router.delete('/:orderId', cancelOrder);

// GET order invoice
router.get('/:orderId/invoice', getOrderInvoice);

export default router;
