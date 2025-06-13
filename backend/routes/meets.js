/**
 * Meet/Quiz Routes
 * Handles all quiz-related operations including:
 * - Fetching quizzes
 * - Starting quiz attempts
 * - Submitting answers
 * - Managing leaderboards
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Meet = require('../models/Meet');
const User = require('../models/User'); // Assuming User model is in ../models/User.js
const mongoose = require('mongoose');
const MeetAttempt = require('../models/MeetAttempt');
const Question = require('../models/Question');
const Leaderboard = require('../models/Leaderboard');

// Logging middleware for all routes
router.use((req, res, next) => {
  console.log('\n=== New Request ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Params:', req.params);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('Headers:', {
    authorization: req.headers.authorization ? 'Bearer [HIDDEN]' : 'none',
    'content-type': req.headers['content-type']
  });
  next();
});

/**
 * GET /api/meets/questions/all
 * Retrieves all questions from the database
 * Requires authentication
 */
router.get('/questions/all', auth, async (req, res) => {
  try {
    console.log('Fetching all questions');
    const questions = await Question.find()
      .select('text options correctAnswer points timeLimit')
      .lean();
    
    console.log(`Found ${questions.length} questions`);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

/**
 * GET /api/meets/:id
 * Retrieves a specific quiz/meet by ID
 * Requires authentication
 */
router.get('/:id', auth, async (req, res) => {
  console.log('\n=== GET Single Meet ===');
  console.log('Meet ID:', req.params.id);
  console.log('Meet ID type:', typeof req.params.id);
  console.log('Meet ID length:', req.params.id.length);
  
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid Meet ID format');
      return res.status(400).json({ 
        message: 'Invalid Meet ID format',
        error: 'INVALID_ID_FORMAT'
      });
    }

    const meet = await Meet.findById(req.params.id);
    console.log('Meet found:', meet ? 'Yes' : 'No');
    
    if (!meet) {
      // Find similar IDs to help with typos
      const similarMeets = await Meet.find({
        _id: { $regex: req.params.id.slice(0, -1) }
      }).select('_id title').limit(5);
      
      console.log('Similar meets found:', similarMeets.length);
      
      return res.status(404).json({ 
        message: 'Meet not found',
        error: 'MEET_NOT_FOUND',
        similarMeets: similarMeets.map(m => ({
          id: m._id,
          title: m.title
        }))
      });
    }
    
    console.log('Sending meet data');
    res.json(meet);
  } catch (error) {
    console.error('Error fetching meet:', error);
    res.status(500).json({ 
      message: 'Error fetching meet',
      error: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/meets
 * Retrieves all available quizzes/meets
 * Requires authentication
 */
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching all meets');
    
    // First find all meets
    const meets = await Meet.find();
    if (!meets || meets.length === 0) {
      console.log('No meets found, creating default meets');
      // Create default meets if none exist
      const defaultMeets = [
        {
          title: 'Introduction to React Hooks',
          description: 'Learn about useState, useEffect, and other React Hooks with practical examples.',
          category: 'Web Development',
          time: '10:00 AM',
          duration: 60,
          difficulty: 'medium',
          date: new Date(Date.now() + 3600000),
          transcript: 'Learn about useState, useEffect, and other React Hooks with practical examples.',
          status: 'upcoming',
          questions: []
        },
        {
          title: 'Advanced JavaScript Concepts',
          description: 'Deep dive into closures, promises, and async/await.',
          category: 'Programming',
          time: '2:00 PM',
          duration: 90,
          difficulty: 'hard',
          date: new Date(Date.now() + 7200000),
          transcript: 'Deep dive into closures, promises, and async/await.',
          status: 'upcoming',
          questions: []
        }
      ];

      const createdMeets = await Meet.insertMany(defaultMeets);
      console.log('Created default meets');
      return res.json(createdMeets);
    }

    // Populate questions for all meets
    const populatedMeets = await Meet.find()
      .populate({
        path: 'questions',
        model: 'Question',
        select: 'text options correctAnswer points timeLimit'
      })
      .populate('participants', 'name email')
      .lean();

    console.log(`Found ${populatedMeets.length} meets with populated questions`);
    res.json(populatedMeets);
  } catch (error) {
    console.error('Error fetching meets:', error);
    res.status(500).json({ message: 'Error fetching meets', error: error.message });
  }
});

/**
 * POST /api/meets
 * Creates a new quiz/meet
 * Requires authentication
 */
router.post('/', auth, async (req, res) => {
  const { title, description, date, duration, category, time, difficulty, transcript, questions } = req.body;

  const meet = new Meet({
    title,
    description,
    date,
    duration,
    category,
    time,
    difficulty,
    transcript,
    questions,
    participants: [], // Initialize empty participants array
    leaderboard: [] // Initialize empty leaderboard array
  });

  try {
    const savedMeet = await meet.save();
    res.status(201).json(savedMeet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /api/meets/:id/leaderboard
 * Retrieves the leaderboard for a specific quiz/meet
 * Requires authentication
 */
router.get('/:id/leaderboard', auth, async (req, res) => {
  try {
    const meet = await Meet.findById(req.params.id).populate('leaderboard.userId', 'username');
    if (!meet) {
      return res.status(404).json({ message: 'Meet not found' });
    }
    res.json(meet.leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/meets/:id/start
 * Starts a new quiz attempt
 * - Adds user to participants
 * - Initializes leaderboard entry
 * Requires authentication
 */
router.post('/:id/start', auth, async (req, res) => {
  console.log('\n=== Start Quiz Attempt ===');
  console.log('Meet ID:', req.params.id);
  console.log('Meet ID type:', typeof req.params.id);
  console.log('Meet ID length:', req.params.id.length);
  console.log('User ID:', req.user?._id);
  
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid Meet ID format');
      return res.status(400).json({ 
        message: 'Invalid Meet ID format',
        error: 'INVALID_ID_FORMAT'
      });
    }

    const meet = await Meet.findById(req.params.id);
    console.log('Meet found:', meet ? 'Yes' : 'No');
    
    if (!meet) {
      // Find similar IDs to help with typos
      const similarMeets = await Meet.find({
        _id: { $regex: req.params.id.slice(0, -1) }
      }).select('_id title').limit(5);
      
      console.log('Similar meets found:', similarMeets.length);
      
      return res.status(404).json({ 
        message: 'Meet not found',
        error: 'MEET_NOT_FOUND',
        similarMeets: similarMeets.map(m => ({
          id: m._id,
          title: m.title
        }))
      });
    }

    if (!req.user || !req.user._id) {
      console.log('User not authenticated, returning 401');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Initialize participants array if undefined
    if (!meet.participants) {
      console.log('Initializing empty participants array');
      meet.participants = [];
    }

    // Add user to participants if not already present
    if (!meet.participants.includes(req.user._id)) {
      console.log('Adding user to participants');
      meet.participants.push(req.user._id);
    } else {
      console.log('User already in participants');
    }

    // Initialize leaderboard array if undefined
    if (!meet.leaderboard) {
      console.log('Initializing empty leaderboard array');
      meet.leaderboard = [];
    }

    // Initialize leaderboard entry if not exists
    const existingEntry = meet.leaderboard.find(
      entry => entry.userId && entry.userId.toString() === req.user._id.toString()
    );

    if (!existingEntry) {
      console.log('Creating new leaderboard entry for user');
      meet.leaderboard.push({
        userId: req.user._id,
        score: 0,
        timeTaken: 0,
        answers: []
      });
    } else {
      console.log('User already has leaderboard entry');
    }

    // Use findByIdAndUpdate to preserve existing fields
    console.log('Updating meet with new participants and leaderboard');
    const updatedMeet = await Meet.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          participants: meet.participants,
          leaderboard: meet.leaderboard
        }
      },
      { new: true, runValidators: false }
    );

    // Create a new attempt
    const attempt = new MeetAttempt({
      user: req.user._id,
      meet: updatedMeet._id,
      startTime: new Date()
    });
    console.log('Quiz started successfully');
    res.json({ message: 'Quiz started successfully', meet: updatedMeet });
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/meets/:id/submit
 * Submits quiz answers and updates leaderboard
 * - Calculates score
 * - Updates leaderboard
 * - Sorts leaderboard by score and time
 * Requires authentication
 */
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { score, timeTaken, answers } = req.body;
    const meetId = req.params.id;
    const userId = req.user._id;

    // Validate answers array
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers must be an array' });
    }

    // Create meet attempt
    const meetAttempt = new MeetAttempt({
      meetId,
      userId,
      score,
      timeTaken,
      answers: answers.map(answer => ({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect
      }))
    });

    await meetAttempt.save();

    // Update leaderboard
    let leaderboard = await Leaderboard.findOne({ meetId });
    
    if (!leaderboard) {
      leaderboard = new Leaderboard({
        meetId,
        entries: []
      });
    }

    // Find existing entry for user
    const existingEntryIndex = leaderboard.entries.findIndex(
      entry => entry.userId.toString() === userId.toString()
    );

    if (existingEntryIndex !== -1) {
      // Update existing entry if new score is higher or same score but faster time
      const existingEntry = leaderboard.entries[existingEntryIndex];
      if (score > existingEntry.score || 
          (score === existingEntry.score && timeTaken < existingEntry.timeTaken)) {
        leaderboard.entries[existingEntryIndex] = {
          userId,
          score,
          timeTaken,
          name: req.user.name
        };
      }
    } else {
      // Add new entry
      leaderboard.entries.push({
        userId,
        score,
        timeTaken,
        name: req.user.name
      });
    }

    // Sort leaderboard by score (descending) and time (ascending)
    leaderboard.entries.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeTaken - b.timeTaken;
    });

    await leaderboard.save();

    res.json({
      message: 'Quiz submitted successfully',
      score,
      timeTaken,
      leaderboard: leaderboard.entries
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Error submitting quiz', error: error.message });
  }
});

/**
 * PATCH /api/meets/:id/status
 * Updates the status of a quiz/meet
 * Requires authentication
 */
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const meet = await Meet.findById(req.params.id);
    if (!meet) {
      return res.status(404).json({ message: 'Meet not found' });
    }
    meet.status = req.body.status;
    const updatedMeet = await meet.save();
    res.json(updatedMeet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * DELETE /api/meets/:id
 * Deletes a quiz/meet
 * Requires authentication
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const meet = await Meet.findById(req.params.id);
    if (!meet) {
      return res.status(404).json({ message: 'Meet not found' });
    }
    await meet.deleteOne();
    res.json({ message: 'Meet deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/meets/:id/evaluate
 * Evaluates quiz answers and returns results
 * Requires authentication
 */
router.post('/:id/evaluate', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    // Get the meet
    const meet = await Meet.findById(id);
    if (!meet) {
      return res.status(404).json({ error: 'Meet not found' });
    }

    // Evaluate answers
    let score = 0;
    const evaluatedAnswers = meet.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) score++;
      return {
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    // Calculate accuracy
    const accuracy = (score / meet.questions.length) * 100;

    // Get leaderboard data
    const leaderboard = await MeetAttempt.find({ meet: id })
      .populate('user', 'name email')
      .sort({ score: -1 })
      .limit(10);

    res.json({
      score,
      totalQuestions: meet.questions.length,
      accuracy,
      evaluatedAnswers,
      leaderboard: leaderboard.map(attempt => ({
        userId: attempt.user._id,
        username: attempt.user.name,
        score: attempt.score
      }))
    });
  } catch (error) {
    console.error('Error evaluating quiz:', error);
    res.status(500).json({ error: 'Failed to evaluate quiz' });
  }
});

/**
 * GET /api/meets/:id/details
 * Retrieves meet details including questions
 * Requires authentication
 */
router.get('/:id/details', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const meet = await Meet.findById(id);
    
    if (!meet) {
      return res.status(404).json({ error: 'Meet not found' });
    }

    // For the first two meets, include questions
    if (meet._id.toString() === '684ad77dd03755e6be1950ee' || 
        meet._id.toString() === '684ad77dd03755e6be1950ef') {
      res.json({
        ...meet.toObject(),
        questions: meet.questions.map(q => ({
          _id: q._id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        }))
      });
    } else {
      // For other meets, exclude questions
      const { questions, ...meetDetails } = meet.toObject();
      res.json(meetDetails);
    }
  } catch (error) {
    console.error('Error fetching meet details:', error);
    res.status(500).json({ error: 'Failed to fetch meet details' });
  }
});

/**
 * GET /api/meets/stats
 * Retrieves user statistics
 * Requires authentication
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's meet attempts
    const meetAttempts = await MeetAttempt.find({ user: userId })
      .populate('meet', 'title category')
      .sort({ endTime: -1 });

    // Calculate statistics
    const totalScore = meetAttempts.reduce((acc, attempt) => acc + (attempt.score || 0), 0);
    const totalMeets = meetAttempts.length;
    const totalQuestions = meetAttempts.reduce((acc, attempt) => acc + (attempt.answers?.length || 0), 0);
    const correctAnswers = meetAttempts.reduce((acc, attempt) => 
      acc + (attempt.answers?.filter(a => a.isCorrect).length || 0), 0);
    
    // Calculate accuracy
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Calculate current streak
    let currentStreak = 0;
    let lastDate = null;
    
    for (const attempt of meetAttempts) {
      const attemptDate = new Date(attempt.endTime).toDateString();
      if (!lastDate) {
        lastDate = attemptDate;
        currentStreak = 1;
      } else {
        const lastDateObj = new Date(lastDate);
        const attemptDateObj = new Date(attemptDate);
        const diffDays = Math.floor((lastDateObj - attemptDateObj) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
          lastDate = attemptDate;
        } else {
          break;
        }
      }
    }

    // Calculate weekly progress (last 7 days)
    const weeklyProgress = Array(7).fill().map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayAttempts = meetAttempts.filter(attempt => 
        new Date(attempt.endTime).toDateString() === date.toDateString()
      );
      const dayScore = dayAttempts.reduce((acc, attempt) => acc + (attempt.score || 0), 0);
      return { day: dayName, score: dayScore };
    }).reverse();

    // Calculate category breakdown
    const categoryBreakdown = meetAttempts.reduce((acc, attempt) => {
      const category = attempt.meet?.category || 'General';
      if (!acc[category]) {
        acc[category] = { correct: 0, total: 0 };
      }
      acc[category].correct += attempt.answers?.filter(a => a.isCorrect).length || 0;
      acc[category].total += attempt.answers?.length || 0;
      return acc;
    }, {});

    const categoryBreakdownArray = Object.entries(categoryBreakdown).map(([category, stats]) => ({
      category,
      correct: stats.correct,
      total: stats.total
    }));

    // Get recent activity
    const recentActivity = meetAttempts.slice(0, 5).map(attempt => ({
      date: new Date(attempt.endTime).toLocaleDateString(),
      score: attempt.score || 0,
      questions: attempt.answers?.length || 0
    }));

    res.json({
      totalScore,
      totalMeets,
      accuracy,
      currentStreak,
      totalQuestions,
      correctAnswers,
      weeklyProgress,
      categoryBreakdown: categoryBreakdownArray,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/meets/leaderboard
 * Retrieves the global leaderboard
 * Requires authentication
 */
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const meetAttempts = await MeetAttempt.aggregate([
      {
        $group: {
          _id: '$user',
          totalScore: { $sum: '$score' },
          totalMeets: { $sum: 1 },
          lastAttempt: { $max: '$endTime' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          _id: 1,
          name: '$userDetails.name',
          totalScore: 1,
          totalMeets: 1,
          lastAttempt: 1
        }
      },
      {
        $sort: { totalScore: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(meetAttempts);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
