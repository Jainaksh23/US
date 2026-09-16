const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Couple = require('../models/Couple');

const router = express.Router();

// Register a new couple
router.post('/register', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected. Please set up MongoDB Atlas and add MONGODB_URI to your .env file.' });
    }

    const { coupleName, secret, partner1, partner2 } = req.body;

    if (!coupleName || !secret || !partner1 || !partner2) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Couple.findOne({ coupleName });
    if (existing) {
      return res.status(400).json({ message: 'This couple name is already taken' });
    }

    const couple = new Couple({
      coupleName,
      secret,
      partners: [
        { name: partner1, avatar: '💖' },
        { name: partner2, avatar: '💕' },
      ],
    });

    await couple.save();

    const token = jwt.sign(
      { coupleId: couple._id, partnerName: partner1 },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      couple: {
        id: couple._id,
        coupleName: couple.coupleName,
        partners: couple.partners,
      },
      currentPartner: partner1,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Failed to save to database. Check console for details.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected. Please set up MongoDB Atlas and add MONGODB_URI to your .env file.' });
    }

    const { coupleName, secret, partnerName } = req.body;

    if (!coupleName || !secret || !partnerName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const couple = await Couple.findOne({ coupleName });
    if (!couple) {
      return res.status(401).json({ message: 'Couple not found' });
    }

    const isMatch = await couple.compareSecret(secret);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect secret' });
    }

    // Verify partner name exists in the couple
    const partner = couple.partners.find(
      (p) => p.name.toLowerCase() === partnerName.toLowerCase()
    );
    if (!partner) {
      return res.status(401).json({ message: 'Partner name not recognized' });
    }

    const token = jwt.sign(
      { coupleId: couple._id, partnerName: partner.name },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      couple: {
        id: couple._id,
        coupleName: couple.coupleName,
        partners: couple.partners,
      },
      currentPartner: partner.name,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
