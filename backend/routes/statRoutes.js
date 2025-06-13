const express = require('express');
const { getUserStats, addDummyUserStats } = require('../src/controllers/statController');
const { auth } = require('../middleware/auth');
const Stat = require('../models/Stat');

const router = express.Router();

// No longer protecting all routes by default. 
// Each route will explicitly use middleware if needed.

router.get('/:userId', auth, getUserStats); // Protected route for getting user stats
router.post('/dummy/:userId', addDummyUserStats); // Unprotected for dummy data insertion

// Get user stats
router.get('/user', auth, async (req, res) => {
  try {
    let userStats = await Stat.findOne({ userId: req.user._id });
    if (!userStats) {
      userStats = new Stat({ userId: req.user._id });
      await userStats.save();
    }
    res.json(userStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
});

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const leaderboard = await Stat.find()
      .sort({ totalScore: -1 })
      .limit(10)
      .populate('userId', 'name email');
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

module.exports = router; 