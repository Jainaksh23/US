const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
  coupleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Couple',
    required: true,
  },
  game: {
    type: String,
    enum: ['truthordare', 'wyr', 'personalqa', 'quiz', 'coupons'],
    required: true,
  },
  mode: {
    type: String,
    enum: ['sweet', 'playful', 'mysterious', 'deeptalk'],
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  partner: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GameHistory', gameHistorySchema);
