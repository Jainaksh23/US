const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  coupleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Couple',
    default: null, // null = global/seed question
  },
  game: {
    type: String,
    enum: ['truth', 'dare', 'wyr', 'personalqa', 'quiz'],
    required: true,
  },
  mode: {
    type: String,
    enum: ['sweet', 'playful', 'mysterious', 'deeptalk'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  // For WYR: the two options
  optionA: String,
  optionB: String,
  // For quiz: multiple choice answers
  choices: [String],
  correctAnswer: Number,
  createdBy: {
    type: String, // partner name
    default: 'system',
  },
  usedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Question', questionSchema);
