const Stat = require('../../models/Stat');
const User = require('../../models/User'); // Assuming you have a User model

// Helper to get or create a stat document for a user
const getOrCreateStat = async (userId) => {
  let stat = await Stat.findOne({ userId });
  if (!stat) {
    stat = new Stat({ userId });
    await stat.save();
  }
  return stat;
};

// @desc    Get user statistics
// @route   GET /api/stats/:userId
// @access  Private (user self or admin)
const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const stat = await Stat.findOne({ userId }).populate('userId', 'name email avatar');

    if (!stat) {
      return res.status(404).json({ message: 'Statistics not found for this user.' });
    }

    res.status(200).json(stat);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add dummy stats data for a user (for development/testing)
// @route   POST /api/stats/dummy/:userId
// @access  Private (for initial setup)
const addDummyUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const userExists = await User.findById(userId);

    if (!userExists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let stat = await Stat.findOne({ userId });
    if (stat) {
      // If stats already exist, update them (or clear and re-add)
      // For now, let's just update some fields with dummy data
      stat.totalMeets = 5 + Math.floor(Math.random() * 5);
      stat.totalQuestionsAnswered = 50 + Math.floor(Math.random() * 50);
      stat.correctAnswers = Math.floor(stat.totalQuestionsAnswered * (0.6 + Math.random() * 0.3));
      stat.averageScore = (stat.correctAnswers / stat.totalQuestionsAnswered) * 100 || 0;
      stat.leaderboardRank = Math.floor(Math.random() * 100) + 1;

      // Add dummy meeting performance data
      stat.meetingsPerformance = [];
      for (let i = 0; i < stat.totalMeets; i++) {
        stat.meetingsPerformance.push({
          // meetId: 'dummyMeetId' + i, // You'd link this to actual meet IDs
          date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000 * (Math.random() * 7 + 1))), // Random dates
          score: Math.floor(Math.random() * 100),
          questionsAnswered: Math.floor(Math.random() * 20) + 5,
          correctCount: Math.floor(Math.random() * (Math.floor(Math.random() * 20) + 5)),
        });
      }
      await stat.save();
      return res.status(200).json({ message: 'Dummy stats updated successfully', stat });

    } else {
      // Create new dummy stats
      stat = new Stat({
        userId,
        totalMeets: 5 + Math.floor(Math.random() * 5),
        totalQuestionsAnswered: 50 + Math.floor(Math.random() * 50),
        correctAnswers: 30 + Math.floor(Math.random() * 20),
        averageScore: 70 + Math.floor(Math.random() * 20),
        leaderboardRank: Math.floor(Math.random() * 100) + 1,
        meetingsPerformance: [],
      });

      // Add dummy meeting performance data
      for (let i = 0; i < stat.totalMeets; i++) {
        stat.meetingsPerformance.push({
          // meetId: 'dummyMeetId' + i,
          date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000 * (Math.random() * 7 + 1))), // Random dates
          score: Math.floor(Math.random() * 100),
          questionsAnswered: Math.floor(Math.random() * 20) + 5,
          correctCount: Math.floor(Math.random() * (Math.floor(Math.random() * 20) + 5)),
        });
      }
      await stat.save();
      res.status(201).json({ message: 'Dummy stats added successfully', stat });
    }
  } catch (error) {
    console.error('Error adding dummy user stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserStats,
  addDummyUserStats,
}; 