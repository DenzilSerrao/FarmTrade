import { Schema, model } from 'mongoose';

const paymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    phonepeTransactionId: {
      type: String,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: ['phonepe', 'cod', 'upi', 'card'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentGatewayResponse: {
      type: Schema.Types.Mixed,
    },
    failureReason: {
      type: String,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
    },
    refundedAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ userId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ phonepeTransactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model('Payment', paymentSchema);