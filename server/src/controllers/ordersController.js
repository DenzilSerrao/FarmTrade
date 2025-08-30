// controllers/ordersController.js
const express = require('express');
const router = express.Router();
const OrderService = require('../services/orderService');

// Create an instance of OrderService
const orderService = new OrderService();

// GET: /api/orders
router.get('/', async (req, res) => {
  try {
    const orders = await orderService.getOrders();
    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST: /api/orders
router.post('/', async (req, res) => {
  try {
    const order = req.body;

    if (!order) {
      return res.status(400).json({ message: 'Order cannot be null.' });
    }

    const createdOrder = await orderService.createOrder(order);

    res.status(201).json({
      message: 'Order created successfully',
      createdOrder,
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
