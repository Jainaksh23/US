const express = require('express');
const auth = require('../middleware/auth');
const Question = require('../models/Question');
const GameHistory = require('../models/GameHistory');

const router = express.Router();

const Progress = require('../models/Progress');
const { generateMoreContent } = require('../services/contentGenerator');

// Get questions by game and mode (with 90-day exclusion rule)
router.get('/questions/:game/:mode', auth, async (req, res) => {
  try {
    const { game, mode } = req.params;
    
    // Find all seen items across the couple
    const progresses = await Progress.find({ coupleId: req.coupleId });
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentlySeenIds = [];
    progresses.forEach(p => {
      p.seenItems.forEach(item => {
        if (item.game === game && new Date(item.timestamp) > ninetyDaysAgo) {
          recentlySeenIds.push(item.itemId);
        }
      });
    });

    // Fetch questions excluding the recently seen ones
    const questions = await Question.find({
      game,
      mode,
      _id: { $nin: recentlySeenIds },
      $or: [{ coupleId: null }, { coupleId: req.coupleId }],
    });

    // If pool is running low, trigger generation asynchronously
    if (questions.length < 10) {
      generateMoreContent(game, mode).catch(console.error);
    }

    res.json(questions);
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark an item as seen
router.post('/seen', auth, async (req, res) => {
  try {
    const { itemId, game } = req.body;
    
    let progress = await Progress.findOne({ coupleId: req.coupleId, partnerName: req.partnerName });
    if (!progress) {
      progress = new Progress({ coupleId: req.coupleId, partnerName: req.partnerName });
    }

    progress.seenItems.push({ itemId, game });
    await progress.save();
    
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Save seen error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a custom question
router.post('/questions', auth, async (req, res) => {
  try {
    const { game, mode, text, optionA, optionB, choices, correctAnswer } = req.body;

    const question = new Question({
      coupleId: req.coupleId,
      game,
      mode,
      text,
      optionA,
      optionB,
      choices,
      correctAnswer,
      createdBy: req.partnerName,
    });

    await question.save();
    res.status(201).json(question);
  } catch (err) {
    console.error('Add question error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get game history
router.get('/history/:game', auth, async (req, res) => {
  try {
    const history = await GameHistory.find({
      coupleId: req.coupleId,
      game: req.params.game,
    }).sort({ timestamp: -1 }).limit(50);
    res.json(history);
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save game result
router.post('/history', auth, async (req, res) => {
  try {
    const { game, mode, data } = req.body;

    const entry = new GameHistory({
      coupleId: req.coupleId,
      game,
      mode,
      data,
      partner: req.partnerName,
    });

    await entry.save();

    // Update Progress
    let progress = await Progress.findOne({ coupleId: req.coupleId, partnerName: req.partnerName });
    if (!progress) {
      progress = new Progress({ coupleId: req.coupleId, partnerName: req.partnerName });
    }

    progress.gamesPlayed += 1;
    
    // Update score if it's a quiz
    if (game === 'quiz' && data.correct) {
      progress.quizScoreTotal += 1;
    }

    // Streak logic
    const now = new Date();
    if (!progress.lastPlayedDate) {
      progress.currentStreak = 1;
      progress.longestStreak = 1;
    } else {
      const lastPlayed = new Date(progress.lastPlayedDate);
      const diffTime = Math.abs(now - lastPlayed);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1 || diffDays === 0) { // Played today or yesterday
        // If it's a new day, increment streak
        if (lastPlayed.getDate() !== now.getDate() || lastPlayed.getMonth() !== now.getMonth()) {
           progress.currentStreak += 1;
           if (progress.currentStreak > progress.longestStreak) {
             progress.longestStreak = progress.currentStreak;
           }
        }
      } else if (diffDays > 1) { // Streak broken
        progress.currentStreak = 1;
      }
    }
    
    progress.lastPlayedDate = now;
    await progress.save();

    res.status(201).json(entry);
  } catch (err) {
    console.error('Save history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
