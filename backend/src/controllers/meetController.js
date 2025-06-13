const Meet = require('../models/Meet');
const User = require('../models/User');

// Get all available meets
exports.getMeets = async (req, res) => {
  try {
    const meets = await Meet.find({ status: 'active' })
      .select('title description duration participants questions')
      .sort({ createdAt: -1 });
    
    console.log('Fetched meets:', JSON.stringify(meets, null, 2));
    
    // Ensure questions array exists for each meet
    const meetsWithQuestions = meets.map(meet => {
      const meetObj = meet.toObject();
      console.log(`Meet ${meetObj.title} questions:`, meetObj.questions);
      return {
        ...meetObj,
        questions: Array.isArray(meetObj.questions) ? meetObj.questions : []
      };
    });

    res.json(meetsWithQuestions);
  } catch (error) {
    console.error('Error fetching meets:', error);
    res.status(500).json({ message: 'Error fetching meets' });
  }
};

// Get user stats
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .select('totalScore totalMeets accuracy currentStreak totalQuestions correctAnswers');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      totalScore: user.totalScore || 0,
      totalMeets: user.totalMeets || 0,
      accuracy: user.accuracy || 0,
      currentStreak: user.currentStreak || 0,
      totalQuestions: user.totalQuestions || 0,
      correctAnswers: user.correctAnswers || 0
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find()
      .select('name totalScore totalMeets avatar')
      .sort({ totalScore: -1 })
      .limit(10);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

// Submit quiz answers
exports.submitQuizAnswers = async (req, res) => {
  try {
    const { meetId, answers } = req.body;
    const userId = req.user._id;

    const meet = await Meet.findById(meetId);
    if (!meet) {
      return res.status(404).json({ message: 'Meet not found' });
    }

    // Calculate score
    let score = 0;
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (answer === meet.questions[index].correctAnswer) {
        score += 10;
        correctAnswers++;
      }
    });

    // Update user stats
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.totalScore += score;
    user.totalMeets += 1;
    user.totalQuestions += meet.questions.length;
    user.correctAnswers += correctAnswers;
    user.accuracy = Math.round((user.correctAnswers / user.totalQuestions) * 100);

    // Update streak
    const today = new Date();
    const lastActivity = user.lastActivity ? new Date(user.lastActivity) : null;
    if (!lastActivity || (today - lastActivity) > 24 * 60 * 60 * 1000) {
      user.currentStreak = 1;
    } else {
      user.currentStreak += 1;
    }
    user.lastActivity = today;

    await user.save();

    res.json({
      score,
      correctAnswers,
      totalScore: user.totalScore,
      accuracy: user.accuracy,
      currentStreak: user.currentStreak
    });
  } catch (error) {
    console.error('Error submitting quiz answers:', error);
    res.status(500).json({ message: 'Error submitting quiz answers' });
  }
}; 