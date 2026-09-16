const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');

// Get progress for a specific partner
router.get('/:partnerName', async (req, res) => {
  try {
    const coupleId = req.couple.coupleId;
    const { partnerName } = req.params;

    let progress = await Progress.findOne({ coupleId, partnerName });

    // If no progress exists yet, return default empty progress
    if (!progress) {
      return res.json({
        gamesPlayed: 0,
        currentStreak: 0,
        longestStreak: 0,
        couponsRedeemed: 0,
        quizScoreTotal: 0,
      });
    }

    // Check if streak is still active (played yesterday or today)
    // In a real app, you'd compare dates properly
    const now = new Date();
    const lastPlayed = progress.lastPlayedDate ? new Date(progress.lastPlayedDate) : null;
    
    if (lastPlayed) {
      const diffTime = Math.abs(now - lastPlayed);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      // If last played was more than 2 days ago, break streak
      if (diffDays > 2 && progress.currentStreak > 0) {
        progress.currentStreak = 0;
        await progress.save();
      }
    }

    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get combined progress for the couple
router.get('/combined/stats', async (req, res) => {
  try {
    const coupleId = req.couple.coupleId;
    
    const progresses = await Progress.find({ coupleId });
    
    if (!progresses || progresses.length === 0) {
      return res.json({
        totalGamesPlayed: 0,
        combinedCoupons: 0,
        currentStreak: 0,
        longestStreak: 0
      });
    }

    // Combine stats
    const totalGamesPlayed = progresses.reduce((acc, p) => acc + p.gamesPlayed, 0);
    const combinedCoupons = progresses.reduce((acc, p) => acc + p.couponsRedeemed, 0);
    
    // Streak is usually considered couple-wide, let's take the max of either
    const currentStreak = Math.max(...progresses.map(p => p.currentStreak));
    const longestStreak = Math.max(...progresses.map(p => p.longestStreak));

    res.json({
      totalGamesPlayed,
      combinedCoupons,
      currentStreak,
      longestStreak,
      partnerStats: progresses.map(p => ({
        name: p.partnerName,
        score: p.quizScoreTotal
      }))
    });
  } catch (error) {
    console.error('Error fetching combined progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
