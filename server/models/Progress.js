const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  coupleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Couple',
    required: true
  },
  partnerName: {
    type: String,
    required: true
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastPlayedDate: {
    type: Date,
    default: null
  },
  couponsRedeemed: {
    type: Number,
    default: 0
  },
  quizScoreTotal: {
    type: Number,
    default: 0
  },
  seenItems: [{
    itemId: { type: String, required: true },
    game: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Ensure a unique progress document per partner per couple
progressSchema.index({ coupleId: 1, partnerName: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
