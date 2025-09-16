import crypto from 'crypto';
import axios from 'axios';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import emailService from '../services/emailService.js';

class PaymentController {
  // Create payment order
  async createPaymentOrder(req, res) {
    try {
      const { amount, cartItems, deliveryAddress, paymentMethod } = req.body;
      const userId = req.user.id;

      // Validate cart items and create orders
      const orders = [];
      let totalAmount = 0;

      for (const cartItem of cartItems) {
        // Verify product availability
        const product = await Item.findById(cartItem.productId);
        if (!product || !product.available || product.quantity < cartItem.quantity) {
          return res.status(400).json({
            success: false,
            message: `${cartItem.productName} is not available in requested quantity`,
          });
        }

        // Create order
        const order = new Order({
          buyerId: userId,
          sellerId: cartItem.sellerId,
          productId: cartItem.productId,
          productName: cartItem.productName,
          quantity: cartItem.quantity,
          unit: cartItem.unit,
          pricePerUnit: cartItem.pricePerUnit,
          totalPrice: cartItem.totalPrice,
          shippingAddress: deliveryAddress,
          status: 'pending',
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        });

        await order.save();
        orders.push(order);
        totalAmount += cartItem.totalPrice;

        // Reserve product quantity
        product.quantity -= cartItem.quantity;
        if (product.quantity <= 0) {
          product.available = false;
        }
        await product.save();
      }

      if (paymentMethod === 'cod') {
        // For COD, mark orders as confirmed
        for (const order of orders) {
          order.paymentStatus = 'pending';
          await order.save();
        }

        // Send confirmation emails
        await this.sendOrderConfirmationEmails(orders, deliveryAddress);

        return res.json({
          success: true,
          message: 'Order placed successfully',
          data: { orders },
        });
      }

      // For PhonePe payment
      const transactionId = `TXN_${Date.now()}_${userId}`;
      
      // Create payment record
      const payment = new Payment({
        userId,
        orderId: orders[0]._id, // Primary order for reference
        transactionId,
        amount: totalAmount,
        paymentMethod: 'phonepe',
        status: 'pending',
      });

      await payment.save();

      // Generate PhonePe payment URL
      const paymentUrl = await this.generatePhonePePaymentUrl({
        transactionId,
        amount: totalAmount,
        userId,
        userPhone: deliveryAddress.phone,
      });

      res.json({
        success: true,
        data: {
          transactionId,
          paymentUrl,
          orders,
        },
      });
    } catch (error) {
      console.error('Create payment order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
      });
    }
  }

  // Generate PhonePe payment URL
  async generatePhonePePaymentUrl({ transactionId, amount, userId, userPhone }) {
    try {
      const merchantId = process.env.PHONEPE_MERCHANT_ID;
      const saltKey = process.env.PHONEPE_SALT_KEY;
      const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';

      const paymentPayload = {
        merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: userId,
        amount: amount * 100, // Convert to paise
        redirectUrl: `${process.env.FRONTEND_URL}/payment/callback`,
        redirectMode: 'POST',
        callbackUrl: `${process.env.API_URL}/payment/phonepe/callback`,
        mobileNumber: userPhone,
        paymentInstrument: {
          type: 'PAY_PAGE',
        },
      };

      const base64Payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
      const checksum = crypto
        .createHash('sha256')
        .update(base64Payload + '/pg/v1/pay' + saltKey)
        .digest('hex') + '###' + saltIndex;

      const options = {
        method: 'POST',
        url: `${process.env.PHONEPE_BASE_URL}/pg/v1/pay`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
        data: {
          request: base64Payload,
        },
      };

      const response = await axios.request(options);
      
      if (response.data.success) {
        return response.data.data.instrumentResponse.redirectInfo.url;
      } else {
        throw new Error('Failed to generate payment URL');
      }
    } catch (error) {
      console.error('PhonePe payment URL generation error:', error);
      throw error;
    }
  }

  // PhonePe callback handler
  async phonePeCallback(req, res) {
    try {
      const { response } = req.body;
      const saltKey = process.env.PHONEPE_SALT_KEY;
      const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';

      // Verify checksum
      const receivedChecksum = req.headers['x-verify'];
      const calculatedChecksum = crypto
        .createHash('sha256')
        .update(response + '/pg/v1/status/' + saltKey)
        .digest('hex') + '###' + saltIndex;

      if (receivedChecksum !== calculatedChecksum) {
        return res.status(400).json({ success: false, message: 'Invalid checksum' });
      }

      const paymentResponse = JSON.parse(Buffer.from(response, 'base64').toString());
      const { merchantTransactionId, transactionId, amount, state } = paymentResponse;

      // Update payment status
      const payment = await Payment.findOne({ transactionId: merchantTransactionId });
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }

      payment.phonepeTransactionId = transactionId;
      payment.paymentGatewayResponse = paymentResponse;

      if (state === 'COMPLETED') {
        payment.status = 'success';
        payment.paidAt = new Date();

        // Update related orders
        const orders = await Order.find({ buyerId: payment.userId, createdAt: { $gte: payment.createdAt } });
        for (const order of orders) {
          order.paymentStatus = 'paid';
          order.status = 'accepted';
          await order.save();
        }

        // Send confirmation emails
        await this.sendOrderConfirmationEmails(orders);
      } else {
        payment.status = 'failed';
        payment.failureReason = paymentResponse.responseCodeDescription;

        // Restore product quantities
        await this.restoreProductQuantities(payment.userId);
      }

      await payment.save();

      res.json({ success: true, data: payment });
    } catch (error) {
      console.error('PhonePe callback error:', error);
      res.status(500).json({ success: false, message: 'Callback processing failed' });
    }
  }

  // Verify payment status
  async verifyPayment(req, res) {
    try {
      const { transactionId } = req.body;

      const payment = await Payment.findOne({ transactionId });
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
      }

      // If payment is still pending, check with PhonePe
      if (payment.status === 'pending' && payment.paymentMethod === 'phonepe') {
        const status = await this.checkPhonePePaymentStatus(transactionId);
        if (status) {
          payment.status = status.state === 'COMPLETED' ? 'success' : 'failed';
          payment.paymentGatewayResponse = status;
          await payment.save();
        }
      }

      res.json({
        success: true,
        data: {
          transactionId: payment.transactionId,
          status: payment.status,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
        },
      });
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
  }

  // Check PhonePe payment status
  async checkPhonePePaymentStatus(transactionId) {
    try {
      const merchantId = process.env.PHONEPE_MERCHANT_ID;
      const saltKey = process.env.PHONEPE_SALT_KEY;
      const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';

      const checksum = crypto
        .createHash('sha256')
        .update(`/pg/v1/status/${merchantId}/${transactionId}` + saltKey)
        .digest('hex') + '###' + saltIndex;

      const options = {
        method: 'GET',
        url: `${process.env.PHONEPE_BASE_URL}/pg/v1/status/${merchantId}/${transactionId}`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': merchantId,
        },
      };

      const response = await axios.request(options);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('PhonePe status check error:', error);
      return null;
    }
  }

  // Send order confirmation emails
  async sendOrderConfirmationEmails(orders, deliveryAddress) {
    try {
      for (const order of orders) {
        await order.populate(['buyerId', 'sellerId', 'productId']);

        // Email to buyer
        await emailService.sendOrderConfirmation(
          order.buyerId.email,
          order.buyerId.name,
          order._id,
          order.productName,
          order.totalPrice,
          deliveryAddress
        );

        // Email to seller
        await emailService.sendNewOrderNotification(
          order.sellerId.email,
          order.sellerId.name,
          order._id,
          order.productName,
          order.buyerId.name,
          deliveryAddress
        );
      }
    } catch (error) {
      console.error('Error sending confirmation emails:', error);
    }
  }

  // Restore product quantities on payment failure
  async restoreProductQuantities(userId) {
    try {
      const failedOrders = await Order.find({
        buyerId: userId,
        paymentStatus: 'pending',
        createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // Last 30 minutes
      });

      for (const order of failedOrders) {
        const product = await Item.findById(order.productId);
        if (product) {
          product.quantity += order.quantity;
          product.available = true;
          await product.save();
        }

        // Mark order as cancelled
        order.status = 'cancelled';
        order.cancellationReason = 'Payment failed';
        await order.save();
      }
    } catch (error) {
      console.error('Error restoring product quantities:', error);
    }
  }
}

export default new PaymentController();