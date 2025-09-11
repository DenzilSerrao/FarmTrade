import OrderService from '../services/orderService.js';

// GET user's orders
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const orders = await OrderService.getUserOrders(userId, {
      status,
      page,
      limit,
    });
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: 'FETCH_ORDERS_ERROR',
    });
  }
};

// GET specific order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await OrderService.getOrderById(orderId, userId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: 'ORDER_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: 'FETCH_ORDER_ERROR',
    });
  }
};

// POST create new order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderData = {
      ...req.body,
      buyerId: userId,
    };

    // Validation
    if (!orderData.productName || !orderData.quantity || !orderData.sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Product name, quantity, and seller are required',
        error: 'MISSING_REQUIRED_FIELDS',
      });
    }

    const createdOrder = await OrderService.createOrder(orderData);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: createdOrder,
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: 'CREATE_ORDER_ERROR',
    });
  }
};

// PUT update order
export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const updatedOrder = await OrderService.updateOrder(
      orderId,
      userId,
      updateData
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied',
        error: 'ORDER_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder,
    });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: 'UPDATE_ORDER_ERROR',
    });
  }
};

// DELETE cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const cancelled = await OrderService.cancelOrder(orderId, userId);

    if (!cancelled) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or cannot be cancelled',
        error: 'CANCEL_ORDER_FAILED',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: 'CANCEL_ORDER_ERROR',
    });
  }
};

// GET order invoice
export const getOrderInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const invoice = await OrderService.generateInvoice(orderId, userId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
        error: 'INVOICE_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: 'FETCH_INVOICE_ERROR',
    });
  }
};

const ordersController = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  getOrderInvoice,
};

export default ordersController;
