const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const coupleSchema = new mongoose.Schema({
  coupleName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  secret: {
    type: String,
    required: true,
  },
  partners: [
    {
      name: { type: String, required: true, trim: true },
      avatar: { type: String, default: '💕' },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash secret before saving
coupleSchema.pre('save', async function (next) {
  if (!this.isModified('secret')) return next();
  this.secret = await bcrypt.hash(this.secret, 12);
  next();
});

// Compare secret
coupleSchema.methods.compareSecret = async function (candidateSecret) {
  return bcrypt.compare(candidateSecret, this.secret);
};

module.exports = mongoose.model('Couple', coupleSchema);
