const express = require('express');
const router = express.Router();
const Meet = require('../models/Meet');
const Question = require('../models/Question');
const UserPerformance = require('../models/UserPerformance');
const Stat = require('../models/Stat');
const auth = require('../middleware/auth');

// Get all meets
router.get('/', auth, async (req, res) => {
  try {
    const meets = await Meet.find().sort({ date: -1 });
    res.json(meets);
  } catch (error) {
    console.error('Error fetching meets:', error);
    res.status(500).json({ message: 'Error fetching meets' });
  }
});

// Get a specific meet with its questions
router.get('/:meetId', auth, async (req, res) => {
  try {
    const meet = await Meet.findById(req.params.meetId);
    if (!meet) {
      return res.status(404).json({ message: 'Meet not found' });
    }

    const questions = await Question.find({ meetId: meet._id });
    res.json({ meet, questions });
  } catch (error) {
    console.error('Error fetching meet:', error);
    res.status(500).json({ message: 'Error fetching meet' });
  }
});

// Submit meet performance
router.post('/:meetId/submit', auth, async (req, res) => {
  try {
    const { questionsAttempted } = req.body;
    const meetId = req.params.meetId;
    const userId = req.user._id;

    // Calculate performance metrics
    const totalQuestions = questionsAttempted.length;
    const correctAnswers = questionsAttempted.filter(q => q.isCorrect).length;
    const totalScore = questionsAttempted.reduce((acc, q) => acc + q.pointsEarned, 0);
    const averageTimePerQuestion = questionsAttempted.reduce((acc, q) => acc + q.timeTaken, 0) / totalQuestions;

    // Create user performance record
    const performance = await UserPerformance.create({
      userId,
      meetId,
      questionsAttempted,
      totalScore,
      totalQuestions,
      correctAnswers,
      averageTimePerQuestion
    });

    // Update meet participants count
    await Meet.findByIdAndUpdate(meetId, { $inc: { participants: 1 } });

    // Update user stats
    let userStats = await Stat.findOne({ userId });
    if (!userStats) {
      userStats = new Stat({ userId });
    }
    await userStats.updateStats(performance);

    res.status(201).json({ message: 'Performance recorded successfully', performance });
  } catch (error) {
    console.error('Error submitting performance:', error);
    res.status(500).json({ message: 'Error submitting performance' });
  }
});

module.exports = router; 