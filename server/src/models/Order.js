import { Schema, model } from 'mongoose';

const OrderSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
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
      enum: [
        'bags',
        'boxes',
        'crates',
        'kg',
        'tons',
        'pieces',
        'bunches',
        'liters',
      ],
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
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'rejected',
        'shipped',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer'],
      default: 'cash',
    },
    estimatedDelivery: {
      type: Date,
    },
    actualDelivery: {
      type: Date,
    },
    trackingNumber: {
      type: String,
      sparse: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
OrderSchema.index({ buyerId: 1, status: 1 });
OrderSchema.index({ sellerId: 1, status: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ estimatedDelivery: 1 });

// Pre-save middleware to calculate total price
OrderSchema.pre('save', function (next) {
  if (this.isModified('quantity') || this.isModified('pricePerUnit')) {
    this.totalPrice = this.quantity * this.pricePerUnit;
  }
  next();
});

// Method to check if user can modify order
OrderSchema.methods.canModify = function (userId) {
  return (
    this.buyerId.toString() === userId.toString() &&
    ['pending', 'accepted'].includes(this.status)
  );
};

// Method to check if user can cancel order
OrderSchema.methods.canCancel = function (userId) {
  return (
    this.buyerId.toString() === userId.toString() &&
    ['pending', 'accepted'].includes(this.status)
  );
};

export default model('Order', OrderSchema);
