const Order = require('../models/Order');
const Item = require('../models/Item');
const User = require('../models/User');

class OrderService {
  // Get user's orders with filtering and pagination
  async getUserOrders(userId, options = {}) {
    try {
      const { status, page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;
      
      const query = {
        $or: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      };
      
      if (status) {
        query.status = status;
      }

      const orders = await Order.find(query)
        .populate('buyerId', 'name email location rating')
        .populate('sellerId', 'name email location rating')
        .populate('productId', 'name images category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Order.countDocuments(query);

      return {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in getUserOrders:', error);
      throw error;
    }
  }

  // Get specific order by ID
  async getOrderById(orderId, userId) {
    try {
      const order = await Order.findOne({
        _id: orderId,
        $or: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      })
      .populate('buyerId', 'name email location rating')
      .populate('sellerId', 'name email location rating')
      .populate('productId', 'name images category description');

      return order;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      throw error;
    }
  }

  // Create new order
  async createOrder(orderData) {
    try {
      // Verify the product exists and is available
      const product = await Item.findById(orderData.productId);
      if (!product || !product.available) {
        throw new Error('Product not available');
      }

      // Check if sufficient quantity is available
      if (product.quantity < orderData.quantity) {
        throw new Error('Insufficient quantity available');
      }

      // Prevent self-ordering
      if (product.ownerId.toString() === orderData.buyerId.toString()) {
        throw new Error('Cannot order your own product');
      }

      const order = new Order({
        ...orderData,
        sellerId: product.ownerId,
        productName: product.name,
        unit: product.unit,
        pricePerUnit: product.price
      });

      await order.save();

      // Populate the order with user and product details
      await order.populate([
        { path: 'buyerId', select: 'name email location' },
        { path: 'sellerId', select: 'name email location' },
        { path: 'productId', select: 'name images category' }
      ]);

      return order;
    } catch (error) {
      console.error('Error in createOrder:', error);
      throw error;
    }
  }

  // Update order (only by buyer or seller with restrictions)
  async updateOrder(orderId, userId, updateData) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        return null;
      }

      // Check permissions
      const isBuyer = order.buyerId.toString() === userId.toString();
      const isSeller = order.sellerId.toString() === userId.toString();
      
      if (!isBuyer && !isSeller) {
        throw new Error('Access denied');
      }

      // Restrict what can be updated based on role and status
      const allowedUpdates = {};
      
      if (isBuyer && order.canModify(userId)) {
        // Buyers can update shipping address and notes
        if (updateData.shippingAddress) allowedUpdates.shippingAddress = updateData.shippingAddress;
        if (updateData.notes) allowedUpdates.notes = updateData.notes;
      }
      
      if (isSeller) {
        // Sellers can update status, tracking, and delivery dates
        if (updateData.status && ['accepted', 'rejected', 'shipped', 'delivered'].includes(updateData.status)) {
          allowedUpdates.status = updateData.status;
        }
        if (updateData.trackingNumber) allowedUpdates.trackingNumber = updateData.trackingNumber;
        if (updateData.estimatedDelivery) allowedUpdates.estimatedDelivery = updateData.estimatedDelivery;
        if (updateData.actualDelivery) allowedUpdates.actualDelivery = updateData.actualDelivery;
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        allowedUpdates,
        { new: true, runValidators: true }
      ).populate([
        { path: 'buyerId', select: 'name email location' },
        { path: 'sellerId', select: 'name email location' },
        { path: 'productId', select: 'name images category' }
      ]);

      return updatedOrder;
    } catch (error) {
      console.error('Error in updateOrder:', error);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId, userId) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        return false;
      }

      if (!order.canCancel(userId)) {
        throw new Error('Cannot cancel this order');
      }

      order.status = 'cancelled';
      await order.save();

      return true;
    } catch (error) {
      console.error('Error in cancelOrder:', error);
      throw error;
    }
  }

  // Generate invoice
  async generateInvoice(orderId, userId) {
    try {
      const order = await Order.findOne({
        _id: orderId,
        $or: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      })
      .populate('buyerId', 'name email location')
      .populate('sellerId', 'name email location')
      .populate('productId', 'name category');

      if (!order) {
        return null;
      }

      // Generate invoice data
      const invoice = {
        orderId: order._id,
        invoiceNumber: `INV-${order._id.toString().slice(-8).toUpperCase()}`,
        orderDate: order.createdAt,
        buyer: order.buyerId,
        seller: order.sellerId,
        product: order.productId,
        quantity: order.quantity,
        unit: order.unit,
        pricePerUnit: order.pricePerUnit,
        totalPrice: order.totalPrice,
        status: order.status,
        shippingAddress: order.shippingAddress
      };

      return invoice;
    } catch (error) {
      console.error('Error in generateInvoice:', error);
      throw error;
    }
  }
}

module.exports = OrderService;