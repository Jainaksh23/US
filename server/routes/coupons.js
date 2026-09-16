const express = require('express');
const auth = require('../middleware/auth');
const Coupon = require('../models/Coupon');

const router = express.Router();

// Get all coupons for the couple
router.get('/', auth, async (req, res) => {
  try {
    const coupons = await Coupon.find({
      $or: [{ coupleId: null, isDefault: true }, { coupleId: req.coupleId }],
    });
    res.json(coupons);
  } catch (err) {
    console.error('Get coupons error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a custom coupon
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, emoji } = req.body;

    const coupon = new Coupon({
      coupleId: req.coupleId,
      title,
      description,
      emoji: emoji || '💝',
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    console.error('Create coupon error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Redeem a coupon
router.patch('/:id/redeem', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (coupon.redeemedAt) {
      return res.status(400).json({ message: 'Coupon already redeemed' });
    }

    coupon.redeemedBy = req.partnerName;
    coupon.redeemedAt = new Date();
    await coupon.save();

    // Update Progress
    const Progress = require('../models/Progress');
    let progress = await Progress.findOne({ coupleId: req.coupleId, partnerName: req.partnerName });
    if (!progress) {
      progress = new Progress({ coupleId: req.coupleId, partnerName: req.partnerName });
    }
    progress.couponsRedeemed += 1;
    await progress.save();

    res.json(coupon);
  } catch (err) {
    console.error('Redeem coupon error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
