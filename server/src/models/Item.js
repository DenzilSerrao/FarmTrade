const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['Vegetables', 'Fruits', 'Grains', 'Herbs', 'Organic', 'Dairy', 'Poultry', 'Livestock']
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['bags', 'boxes', 'crates', 'kg', 'tons', 'pieces', 'bunches', 'liters']
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid image URL'
    }
  }],
  expiryDate: {
    type: Date,
    required: true
  },
  harvestDate: {
    type: Date
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  organic: {
    type: Boolean,
    default: false
  },
  available: {
    type: Boolean,
    default: true
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0
  }
}, {
  timestamps: true
});

// Virtual for low stock status
itemSchema.virtual('lowStock').get(function() {
  return this.quantity <= this.lowStockThreshold;
});

// Index for performance
itemSchema.index({ ownerId: 1, available: 1 });
itemSchema.index({ category: 1, available: 1 });
itemSchema.index({ expiryDate: 1 });

// Ensure virtuals are included in JSON
itemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Item', itemSchema);