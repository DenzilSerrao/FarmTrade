import Order from '../models/Order.js';
import Item from '../models/Item.js';
import User from '../models/User.js';
import { imageUtils, IMAGE_CATEGORIES } from '../config/images.config.js';
import emailService from './emailService.js';

class OrderService {
  // Get user's orders with filtering and pagination
  async getUserOrders(userId, options = {}) {
    try {
      const { status, role, page = 1, limit = 10, search } = options;
      const skip = (page - 1) * limit;

      let query = {};

      // Filter by role (buyer/seller)
      if (role === 'buyer') {
        query.buyerId = userId;
      } else if (role === 'seller') {
        query.sellerId = userId;
      } else {
        query = { $or: [{ buyerId: userId }, { sellerId: userId }] };
      }

      if (status) {
        query.status = status;
      }

      if (search) {
        query.productName = { $regex: search, $options: 'i' };
      }

      const orders = await Order.find(query)
        .populate('buyerId', 'name email location rating phone')
        .populate('sellerId', 'name email location rating phone totalTrades')
        .populate('productId', 'name images category description unit')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Format orders with image URLs
      const formattedOrders = orders.map((order) =>
        this.formatOrderWithImages(order, userId)
      );

      const total = await Order.countDocuments(query);

      return {
        orders: formattedOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
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
        $or: [{ buyerId: userId }, { sellerId: userId }],
      })
        .populate('buyerId', 'name email location rating phone')
        .populate('sellerId', 'name email location rating phone totalTrades')
        .populate('productId', 'name images category description unit');

      if (!order) return null;

      return this.formatOrderWithImages(order, userId);
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
        throw new Error(`Only ${product.quantity} ${product.unit} available`);
      }

      // Prevent self-ordering
      if (product.ownerId.toString() === orderData.buyerId.toString()) {
        throw new Error('Cannot order your own product');
      }

      // Calculate pricing
      const pricePerUnit = product.price;
      const totalPrice = pricePerUnit * orderData.quantity;

      const order = new Order({
        ...orderData,
        sellerId: product.ownerId,
        productName: product.name,
        unit: product.unit,
        pricePerUnit,
        totalPrice,
        status: 'pending',
      });

      await order.save();

      // Update product quantity
      product.quantity -= orderData.quantity;
      if (product.quantity <= 0) {
        product.available = false;
      }
      await product.save();

      // Populate the order with user and product details
      await order.populate([
        { path: 'buyerId', select: 'name email location phone' },
        { path: 'sellerId', select: 'name email location phone' },
        { path: 'productId', select: 'name images category description' },
      ]);

      // Send notification emails
      try {
        await this.sendOrderNotifications(order, 'created');
      } catch (emailError) {
        console.error('Failed to send order notification:', emailError);
      }

      return this.formatOrderWithImages(order, orderData.buyerId);
    } catch (error) {
      console.error('Error in createOrder:', error);
      throw error;
    }
  }

  // Update order (only by buyer or seller with restrictions)
  async updateOrder(orderId, userId, updateData) {
    try {
      const order = await Order.findById(orderId).populate(
        'buyerId sellerId productId'
      );

      if (!order) {
        return null;
      }

      // Check permissions
      const isBuyer = order.buyerId._id.toString() === userId.toString();
      const isSeller = order.sellerId._id.toString() === userId.toString();

      if (!isBuyer && !isSeller) {
        throw new Error('Access denied');
      }

      // Store previous status for notifications
      const previousStatus = order.status;

      // Restrict what can be updated based on role and status
      const allowedUpdates = {};

      if (isBuyer && order.canModify(userId)) {
        // Buyers can update shipping address and notes before acceptance
        if (updateData.shippingAddress)
          allowedUpdates.shippingAddress = updateData.shippingAddress;
        if (updateData.notes) allowedUpdates.notes = updateData.notes;
        if (updateData.requestedDeliveryDate)
          allowedUpdates.requestedDeliveryDate =
            updateData.requestedDeliveryDate;
      }

      if (isSeller) {
        // Sellers can update status, tracking, and delivery dates
        if (updateData.status) {
          const validStatuses = [
            'accepted',
            'rejected',
            'packed',
            'shipped',
            'delivered',
          ];
          if (validStatuses.includes(updateData.status)) {
            allowedUpdates.status = updateData.status;

            // Handle status-specific updates
            if (updateData.status === 'accepted') {
              allowedUpdates.acceptedAt = new Date();
            } else if (updateData.status === 'shipped') {
              allowedUpdates.shippedAt = new Date();
            } else if (updateData.status === 'delivered') {
              allowedUpdates.deliveredAt = new Date();
            } else if (updateData.status === 'rejected') {
              // Return quantity to product if order is rejected
              await this.returnProductQuantity(
                order.productId._id,
                order.quantity
              );
            }
          }
        }

        if (updateData.trackingNumber)
          allowedUpdates.trackingNumber = updateData.trackingNumber;
        if (updateData.estimatedDelivery)
          allowedUpdates.estimatedDelivery = updateData.estimatedDelivery;
        if (updateData.sellerNotes)
          allowedUpdates.sellerNotes = updateData.sellerNotes;
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        allowedUpdates,
        { new: true, runValidators: true }
      ).populate([
        { path: 'buyerId', select: 'name email location phone' },
        { path: 'sellerId', select: 'name email location phone' },
        { path: 'productId', select: 'name images category' },
      ]);

      // Send notifications if status changed
      if (allowedUpdates.status && allowedUpdates.status !== previousStatus) {
        try {
          await this.sendOrderNotifications(updatedOrder, 'status_changed');
        } catch (emailError) {
          console.error(
            'Failed to send status change notification:',
            emailError
          );
        }
      }

      return this.formatOrderWithImages(updatedOrder, userId);
    } catch (error) {
      console.error('Error in updateOrder:', error);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId, userId, reason = '') {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return false;
      }

      if (!order.canCancel(userId)) {
        throw new Error('Cannot cancel this order at this stage');
      }

      // Return quantity to product
      await this.returnProductQuantity(order.productId, order.quantity);

      order.status = 'cancelled';
      order.cancelledAt = new Date();
      order.cancellationReason = reason;
      order.cancelledBy = userId;
      await order.save();

      // Send cancellation notifications
      try {
        await this.sendOrderNotifications(order, 'cancelled');
      } catch (emailError) {
        console.error('Failed to send cancellation notification:', emailError);
      }

      return true;
    } catch (error) {
      console.error('Error in cancelOrder:', error);
      throw error;
    }
  }

  // Mark order as delivered (by buyer)
  async confirmDelivery(orderId, userId, rating = null, review = '') {
    try {
      const order = await Order.findById(orderId).populate('sellerId');

      if (!order || order.buyerId.toString() !== userId) {
        throw new Error('Order not found or access denied');
      }

      if (order.status !== 'shipped' && order.status !== 'delivered') {
        throw new Error('Order must be shipped before confirming delivery');
      }

      order.status = 'delivered';
      order.deliveredAt = new Date();
      order.buyerRating = rating;
      order.buyerReview = review;

      await order.save();

      // Update seller's rating and trade count
      if (rating) {
        await this.updateSellerRating(order.sellerId._id, rating);
      }

      // Update seller's total trades
      await User.findByIdAndUpdate(order.sellerId._id, {
        $inc: { totalTrades: 1 },
      });

      // Send delivery confirmation
      try {
        await this.sendOrderNotifications(order, 'delivered');
      } catch (emailError) {
        console.error('Failed to send delivery confirmation:', emailError);
      }

      return this.formatOrderWithImages(order, userId);
    } catch (error) {
      console.error('Error in confirmDelivery:', error);
      throw error;
    }
  }

  // Get order analytics for seller
  async getSellerOrderAnalytics(userId, timeframe = '30d') {
    try {
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const analytics = await Order.aggregate([
        {
          $match: {
            sellerId: userId,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$totalPrice' },
          },
        },
      ]);

      const totalOrders = await Order.countDocuments({
        sellerId: userId,
        createdAt: { $gte: startDate },
      });

      const totalRevenue = await Order.aggregate([
        {
          $match: {
            sellerId: userId,
            status: { $in: ['delivered', 'shipped'] },
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' },
          },
        },
      ]);

      const averageRating = await Order.aggregate([
        {
          $match: {
            sellerId: userId,
            buyerRating: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$buyerRating' },
            ratingCount: { $sum: 1 },
          },
        },
      ]);

      return {
        totalOrders,
        ordersByStatus: analytics,
        totalRevenue: totalRevenue[0]?.total || 0,
        averageRating: averageRating[0]?.avgRating || 0,
        totalRatings: averageRating[0]?.ratingCount || 0,
      };
    } catch (error) {
      console.error('Error in getSellerOrderAnalytics:', error);
      throw error;
    }
  }

  // Generate invoice
  async generateInvoice(orderId, userId) {
    try {
      const order = await Order.findOne({
        _id: orderId,
        $or: [{ buyerId: userId }, { sellerId: userId }],
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
        invoiceDate: new Date(),
        orderDate: order.createdAt,
        dueDate:
          order.estimatedDelivery ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        buyer: {
          name: order.buyerId.name,
          email: order.buyerId.email,
          location: order.buyerId.location,
        },
        seller: {
          name: order.sellerId.name,
          email: order.sellerId.email,
          location: order.sellerId.location,
        },
        items: [
          {
            name: order.productName,
            category: order.productId.category,
            quantity: order.quantity,
            unit: order.unit,
            pricePerUnit: order.pricePerUnit,
            totalPrice: order.totalPrice,
          },
        ],
        totalAmount: order.totalPrice,
        status: order.status,
        shippingAddress: order.shippingAddress,
        trackingNumber: order.trackingNumber,
        notes: order.notes,
      };

      return invoice;
    } catch (error) {
      console.error('Error in generateInvoice:', error);
      throw error;
    }
  }

  // Helper method to return product quantity when order is cancelled/rejected
  async returnProductQuantity(productId, quantity) {
    try {
      const product = await Item.findById(productId);
      if (product) {
        product.quantity += quantity;
        product.available = true;
        await product.save();
      }
    } catch (error) {
      console.error('Error returning product quantity:', error);
    }
  }

  // Helper method to update seller rating
  async updateSellerRating(sellerId, newRating) {
    try {
      const seller = await User.findById(sellerId);
      if (!seller) return;

      // Calculate new average rating
      const totalRatings = seller.totalRatings || 0;
      const currentRating = seller.rating || 0;

      const newTotalRatings = totalRatings + 1;
      const updatedRating =
        (currentRating * totalRatings + newRating) / newTotalRatings;

      await User.findByIdAndUpdate(sellerId, {
        rating: Math.round(updatedRating * 100) / 100, // Round to 2 decimal places
        totalRatings: newTotalRatings,
      });
    } catch (error) {
      console.error('Error updating seller rating:', error);
    }
  }

  // Helper method to send order notifications
  async sendOrderNotifications(order, type) {
    const buyerEmail = order.buyerId.email;
    const sellerEmail = order.sellerId.email;
    const productName = order.productName;

    switch (type) {
      case 'created':
        // Notify seller of new order
        await emailService.sendNewOrderNotification(
          sellerEmail,
          order.sellerId.name,
          order._id,
          productName,
          order.buyerId.name
        );

        // Send order confirmation to buyer
        await emailService.sendOrderConfirmation(
          buyerEmail,
          order.buyerId.name,
          order._id,
          productName,
          order.totalPrice
        );
        break;

      case 'status_changed':
        // Notify buyer of status change
        await emailService.sendOrderStatusUpdate(
          buyerEmail,
          order.buyerId.name,
          order._id,
          order.status,
          productName
        );
        break;

      case 'cancelled':
        // Notify both parties of cancellation
        const cancelledBy =
          order.cancelledBy.toString() === order.buyerId._id.toString()
            ? 'buyer'
            : 'seller';

        await emailService.sendOrderCancellation(
          buyerEmail,
          order.buyerId.name,
          order._id,
          productName,
          cancelledBy,
          order.cancellationReason
        );

        if (cancelledBy === 'buyer') {
          await emailService.sendOrderCancellation(
            sellerEmail,
            order.sellerId.name,
            order._id,
            productName,
            cancelledBy,
            order.cancellationReason
          );
        }
        break;

      case 'delivered':
        // Notify seller of delivery confirmation
        await emailService.sendDeliveryConfirmation(
          sellerEmail,
          order.sellerId.name,
          order._id,
          productName,
          order.buyerRating
        );
        break;
    }
  }

  // Helper method to format order with image URLs
  formatOrderWithImages(order, currentUserId) {
    const orderObj = order.toObject();

    // Determine user role for this order
    orderObj.userRole =
      order.buyerId._id.toString() === currentUserId.toString()
        ? 'buyer'
        : 'seller';

    // Format product images if available
    if (
      orderObj.productId &&
      orderObj.productId.images &&
      orderObj.productId.images.length > 0
    ) {
      orderObj.productId.images = orderObj.productId.images.map((img) => ({
        id: img._id,
        filename: img.filename,
        alt: img.alt,
        isPrimary: img.isPrimary,
        urls: {
          thumbnail: imageUtils.getFullUrl(
            IMAGE_CATEGORIES.PRODUCT,
            imageUtils.getVariantFilename(img.filename, 'thumbnail')
          ),
          medium: imageUtils.getFullUrl(
            IMAGE_CATEGORIES.PRODUCT,
            imageUtils.getVariantFilename(img.filename, 'medium')
          ),
          large: imageUtils.getFullUrl(
            IMAGE_CATEGORIES.PRODUCT,
            imageUtils.getVariantFilename(img.filename, 'large')
          ),
          original: imageUtils.getFullUrl(
            IMAGE_CATEGORIES.PRODUCT,
            img.filename
          ),
        },
      }));

      // Set primary image for easy access
      orderObj.productImage =
        orderObj.productId.images.find((img) => img.isPrimary) ||
        orderObj.productId.images[0];
    } else {
      orderObj.productId.images = [];
      orderObj.productImage = null;
    }

    // Add order status information
    orderObj.canCancel = order.canCancel
      ? order.canCancel(currentUserId)
      : false;
    orderObj.canModify = order.canModify
      ? order.canModify(currentUserId)
      : false;

    // Add timeline information
    orderObj.timeline = this.generateOrderTimeline(order);

    return orderObj;
  }

  // Generate order timeline for tracking
  generateOrderTimeline(order) {
    const timeline = [];

    timeline.push({
      status: 'pending',
      label: 'Order Placed',
      date: order.createdAt,
      completed: true,
      description: 'Order has been placed and is awaiting seller confirmation',
    });

    if (order.acceptedAt) {
      timeline.push({
        status: 'accepted',
        label: 'Order Accepted',
        date: order.acceptedAt,
        completed: true,
        description: 'Seller has accepted your order',
      });
    }

    if (order.status === 'packed') {
      timeline.push({
        status: 'packed',
        label: 'Order Packed',
        date: new Date(),
        completed: true,
        description: 'Order has been packed and ready for shipping',
      });
    }

    if (order.shippedAt) {
      timeline.push({
        status: 'shipped',
        label: 'Order Shipped',
        date: order.shippedAt,
        completed: true,
        description: `Order has been shipped${
          order.trackingNumber ? ` - Tracking: ${order.trackingNumber}` : ''
        }`,
      });
    }

    if (order.deliveredAt) {
      timeline.push({
        status: 'delivered',
        label: 'Order Delivered',
        date: order.deliveredAt,
        completed: true,
        description: 'Order has been delivered successfully',
      });
    }

    // Add future steps
    if (
      !order.deliveredAt &&
      order.status !== 'cancelled' &&
      order.status !== 'rejected'
    ) {
      const futureSteps = [];

      if (!order.acceptedAt) {
        futureSteps.push({
          status: 'pending_acceptance',
          label: 'Awaiting Acceptance',
          completed: false,
          description: 'Waiting for seller to accept the order',
        });
      }

      if (order.acceptedAt && !order.shippedAt) {
        futureSteps.push({
          status: 'preparing',
          label: 'Preparing Order',
          completed: false,
          description: 'Order is being prepared for shipping',
        });
      }

      if (!order.deliveredAt) {
        futureSteps.push({
          status: 'delivery',
          label: 'Delivery',
          estimatedDate: order.estimatedDelivery,
          completed: false,
          description: 'Order will be delivered',
        });
      }

      timeline.push(...futureSteps);
    }

    return timeline;
  }

  // Get order statistics for dashboard
  async getOrderStatistics(userId, role = 'both') {
    try {
      let buyerQuery = {};
      let sellerQuery = {};

      if (role === 'buyer' || role === 'both') {
        buyerQuery = { buyerId: userId };
      }

      if (role === 'seller' || role === 'both') {
        sellerQuery = { sellerId: userId };
      }

      const [buyerStats, sellerStats] = await Promise.all([
        role !== 'seller'
          ? Order.aggregate([
              { $match: buyerQuery },
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 },
                  totalSpent: { $sum: '$totalPrice' },
                },
              },
            ])
          : [],

        role !== 'buyer'
          ? Order.aggregate([
              { $match: sellerQuery },
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 },
                  totalEarned: { $sum: '$totalPrice' },
                },
              },
            ])
          : [],
      ]);

      return {
        buyer: buyerStats.reduce((acc, stat) => {
          acc[stat._id] = { count: stat.count, totalSpent: stat.totalSpent };
          return acc;
        }, {}),
        seller: sellerStats.reduce((acc, stat) => {
          acc[stat._id] = { count: stat.count, totalEarned: stat.totalEarned };
          return acc;
        }, {}),
      };
    } catch (error) {
      console.error('Error in getOrderStatistics:', error);
      throw error;
    }
  }
}

export default new OrderService();
