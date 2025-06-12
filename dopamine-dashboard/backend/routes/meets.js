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
const auth = require('../middleware/auth');
const Meet = require('../models/Meet');
const User = require('../models/User'); // Assuming User model is in ../models/User.js

/**
 * GET /api/meets
 * Retrieves all available quizzes/meets
 * Requires authentication
 */
router.get('/', auth, async (req, res) => {
  try {
    const meets = await Meet.find().sort({ date: -1 });
    res.json(meets);
  } catch (error) {
    console.error('Error fetching meets:', error);
    res.status(500).json({ message: 'Error fetching meets' });
  }
});

/**
 * GET /api/meets/:id
 * Retrieves a specific quiz/meet by ID
 * Requires authentication
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const meet = await Meet.findById(req.params.id);
    if (!meet) {
      return res.status(404).json({ message: 'Meet not found' });
    }
    res.json(meet);
  } catch (error) {
    console.error('Error fetching meet:', error);
    res.status(500).json({ message: 'Error fetching meet' });
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
    status: 'upcoming' // Default status
  });

  try {
    const newMeet = await meet.save();
    res.status(201).json(newMeet);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
 * POST /api/meets/:id/start
 * Starts a new quiz attempt
 * - Adds user to participants
 * - Initializes leaderboard entry
 * Requires authentication
 */
router.post('/:id/start', auth, async (req, res) => {
  try {
    const meet = await Meet.findById(req.params.id);
    if (!meet) {
      return res.status(404).json({ message: 'Meet not found' });
    }

    // Add user to participants if not already present
    if (req.user && !meet.participants.includes(req.user._id)) {
      meet.participants.push(req.user._id);
    }

    // Initialize leaderboard entry if not exists
    const existingEntry = meet.leaderboard.find(
      entry => entry.userId && entry.userId.toString() === req.user._id.toString()
    );

    if (!existingEntry) {
      meet.leaderboard.push({
        userId: req.user._id,
        score: 0,
        timeTaken: 0,
        answers: []
      });
    }

    await meet.save();
    res.json({ message: 'Quiz started successfully', meet });
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
    const meet = await Meet.findById(req.params.id);
    if (!meet) {
      return res.status(404).json({ message: 'Meet not found' });
    }

    const { score, timeTaken, answers } = req.body;
    const userId = req.user._id;

    // Update leaderboard
    const existingEntryIndex = meet.leaderboard.findIndex(entry => entry.userId.equals(userId));
    if (existingEntryIndex > -1) {
      // Update existing entry if new score is higher or time taken is less for the same score
      if (score > meet.leaderboard[existingEntryIndex].score ||
          (score === meet.leaderboard[existingEntryIndex].score && timeTaken < meet.leaderboard[existingEntryIndex].timeTaken)) {
        meet.leaderboard[existingEntryIndex].score = score;
        meet.leaderboard[existingEntryIndex].timeTaken = timeTaken;
        meet.leaderboard[existingEntryIndex].submittedAt = Date.now();
        meet.leaderboard[existingEntryIndex].answers = answers;
      }
    } else {
      // Add new entry
      meet.leaderboard.push({
        userId,
        score,
        timeTaken,
        answers,
        submittedAt: Date.now()
      });
    }

    // Sort leaderboard by score (desc) then timeTaken (asc)
    meet.leaderboard.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      } else {
        return a.timeTaken - b.timeTaken;
      }
    });

    await meet.save();

    res.json({
      score,
      totalQuestions: meet.questions.length,
      answers,
      timeTaken,
      leaderboard: meet.leaderboard
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/meets/:id/leaderboard
 * Retrieves the leaderboard for a specific quiz/meet
 * Requires authentication
 */
router.get('/:id/leaderboard', async (req, res) => {
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

module.exports = router;
