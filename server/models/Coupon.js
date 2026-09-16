const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  coupleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Couple',
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    default: '💝',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  redeemedBy: String,
  redeemedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Coupon', couponSchema);
