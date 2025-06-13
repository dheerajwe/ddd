const express = require('express');
const router = express.Router();
const Meet = require('../models/Meet');
const Question = require('../models/Question');
const UserPerformance = require('../models/UserPerformance');
const Stat = require('../models/Stat');
const auth = require('../middleware/auth');

// 
router.get('/', auth, async (req, res) => {
  try {
    const meets = await Meet.find()
      .populate({
        path: 'questions',
        select: 'text options correctAnswer points timeLimit'
      })
      .sort({ date: -1 })
      .lean();

    res.json(meets);
  } catch (error) {
    console.error('Error fetching meets:', error);
    res.status(500).json({ message: 'Error fetching meets' });
  }
});

// Get a specific meet with its questions
router.get('/:meetId', auth, async (req, res) => {
  try {
    console.log('Fetching meet with ID:', req.params.meetId);
    
    // Find the meet and populate questions in a single query
    const meet = await Meet.findById(req.params.meetId)
      .populate({
        path: 'questions',
        select: 'text options correctAnswer points timeLimit'
      })
      .lean();

    if (!meet) {
      console.log('Meet not found');
      return res.status(404).json({ message: 'Meet not found' });
    }

    console.log('Found meet with questions:', {
      id: meet._id,
      title: meet.title,
      questionsCount: meet.questions.length,
      questions: meet.questions
    });

    res.json(meet);
  } catch (error) {
    console.error('Error fetching meet:', error);
    res.status(500).json({ message: 'Error fetching meet', error: error.message });
  }
});

// Get all questions for a specific meet
router.get('/:meetId/questions', auth, async (req, res) => {
  try {
    const questions = await Question.find({ meetId: req.params.meetId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
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