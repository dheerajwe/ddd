const express = require('express');
const router = express.Router();
const meetController = require('../controllers/meetController');
const { protect } = require('../middleware/authMiddleware');

// Get all available meets
router.get('/', protect, meetController.getMeets);

// Get user stats
router.get('/stats/user', protect, meetController.getUserStats);

// Get leaderboard
router.get('/stats/leaderboard', protect, meetController.getLeaderboard);

// Submit quiz answers
router.post('/submit-quiz', protect, meetController.submitQuizAnswers);

// Get student stats
router.get('/stats', protect, async (req, res) => {
  try {
    // For now, return dummy data
    const stats = {
      totalScore: 850,
      totalMeets: 12,
      accuracy: 78.5,
      currentStreak: 5,
      totalQuestions: 120,
      correctAnswers: 94,
      weeklyProgress: [
        { day: 'Mon', score: 75 },
        { day: 'Tue', score: 82 },
        { day: 'Wed', score: 68 },
        { day: 'Thu', score: 90 },
        { day: 'Fri', score: 85 },
        { day: 'Sat', score: 0 },
        { day: 'Sun', score: 0 }
      ],
      categoryBreakdown: [
        { category: 'Math', correct: 35, total: 45 },
        { category: 'Science', correct: 28, total: 35 },
        { category: 'English', correct: 31, total: 40 }
      ],
      recentActivity: [
        { date: '2024-03-15', score: 85, questions: 10 },
        { date: '2024-03-14', score: 78, questions: 8 },
        { date: '2024-03-13', score: 92, questions: 12 }
      ]
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router; 