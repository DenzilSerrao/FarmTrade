// models/Item.js - Updated schema
import { Schema, model } from 'mongoose';

const imageSchema = new Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  variants: {
    thumbnail: { filename: String, url: String },
    medium: { filename: String, url: String },
    large: { filename: String, url: String },
    original: { filename: String, url: String },
  },
  alt: {
    type: String,
    default: '',
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const itemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    images: [imageSchema],
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    organic: {
      type: Boolean,
      default: false,
    },
    harvestDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
    },
    qualityGrade: {
      type: String,
      enum: ['A', 'B', 'C'],
      default: 'B',
    },
    tags: [String],
    views: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for low stock check
itemSchema.virtual('lowStock').get(function () {
  return this.quantity <= this.lowStockThreshold;
});

// Virtual for days until expiry
itemSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null;
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes
itemSchema.index({ ownerId: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ available: 1 });
itemSchema.index({ name: 'text', description: 'text' });
itemSchema.index({ price: 1 });
itemSchema.index({ createdAt: -1 });

export default model('Item', itemSchema);
