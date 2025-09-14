// models/Order.js - Enhanced Order Model
import { Schema, model } from 'mongoose';

const orderSchema = new Schema(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'rejected',
        'packed',
        'shipped',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    notes: String,
    sellerNotes: String,
    trackingNumber: String,
    requestedDeliveryDate: Date,
    estimatedDelivery: Date,

    // Status timestamps
    acceptedAt: Date,
    rejectedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,

    // Cancellation info
    cancellationReason: String,
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    // Rating and review
    buyerRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    buyerReview: String,

    // Payment info (for future implementation)
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: String,
  },
  {
    timestamps: true,
  }
);

// Instance methods
orderSchema.methods.canCancel = function (userId) {
  const isBuyer = this.buyerId.toString() === userId.toString();
  const isSeller = this.sellerId.toString() === userId.toString();

  if (!isBuyer && !isSeller) return false;

  // Buyers can cancel if order is pending or accepted
  if (isBuyer && ['pending', 'accepted'].includes(this.status)) return true;

  // Sellers can cancel if order is pending
  if (isSeller && this.status === 'pending') return true;

  return false;
};

orderSchema.methods.canModify = function (userId) {
  const isBuyer = this.buyerId.toString() === userId.toString();
  return isBuyer && this.status === 'pending';
};

// Indexes
orderSchema.index({ buyerId: 1 });
orderSchema.index({ sellerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export default model('Order', orderSchema);
