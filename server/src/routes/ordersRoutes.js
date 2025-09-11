import express from 'express';
const router = express.Router();
import ordersController from '../controllers/ordersController.js';

// All order routes require authentication (handled by app.js middleware)

// GET user's orders
router.get('/', ordersController.getOrders);

// GET specific order by ID
router.get('/:orderId', ordersController.getOrderById);

// POST create new order
router.post('/', ordersController.createOrder);

// PUT update order (only if user owns it or is admin)
router.put('/:orderId', ordersController.updateOrder);

// DELETE cancel order (only if user owns it)
router.delete('/:orderId', ordersController.cancelOrder);

// GET order invoice
router.get('/:orderId/invoice', ordersController.getOrderInvoice);

export default router;
