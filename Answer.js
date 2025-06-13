const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Meet = require('../models/Meet');
const User = require('../models/User');

// Submit an answer
router.post('/', auth, async (req, res) => {
    try {
        const { questionId, selectedAnswer, timeTaken } = req.body;
        
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        const isCorrect = selectedAnswer === question.correctAnswer;
        let points = 0;

        if (isCorrect) {
            points = question.points; // Base points for correct answer
            if (timeTaken <= 5) { // Bonus for quick answers
                points += 5;
            }
        } else {
            points = -5; // Penalty for wrong answer
        }

        const answer = await Answer.create({
            userId: req.user._id,
            questionId,
            selectedAnswer,
            timeTaken,
            isCorrect,
            points
        });

        res.status(201).json(answer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get meet leaderboard
router.get('/leaderboard/:meetId', auth, async (req, res) => {
    try {
        const meet = await Meet.findById(req.params.meetId);
        if (!meet) {
            return res.status(404).json({ error: 'Meet not found' });
        }

        // Get leaderboard entries with user details
        const leaderboard = await Promise.all(
            meet.leaderboard.map(async (entry) => {
                const user = await User.findById(entry.userId);
                return {
                    _id: entry.userId,
                    name: user ? user.name : 'Unknown User',
                    totalPoints: entry.score,
                    timeTaken: entry.timeTaken,
                    submittedAt: entry.submittedAt,
                    answers: entry.answers
                };
            })
        );

        // Sort by score (desc) and time taken (asc)
        leaderboard.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }
            return a.timeTaken - b.timeTaken;
        });

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get cumulative leaderboard
router.get('/leaderboard/cumulative', auth, async (req, res) => {
    try {
        const leaderboard = await Answer.aggregate([
            {
                $group: {
                    _id: '$userId',
                    totalPoints: { $sum: '$points' },
                    correctAnswers: {
                        $sum: { $cond: ['$isCorrect', 1, 0] }
                    },
                    totalQuestions: { $sum: 1 },
                    averageTime: { $avg: '$timeTaken' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    name: '$user.name',
                    email: '$user.email',
                    totalPoints: 1,
                    correctAnswers: 1,
                    totalQuestions: 1,
                    averageTime: 1,
                    accuracy: {
                        $multiply: [
                            { $divide: ['$correctAnswers', '$totalQuestions'] },
                            100
                        ]
                    }
                }
            },
            {
                $sort: { totalPoints: -1, averageTime: 1 }
            }
        ]);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get authenticated user's performance stats
router.get('/me/stats', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        const userStats = await Answer.aggregate([
            {
                $match: {
                    userId: userId
                }
            },
            {
                $group: {
                    _id: '$userId',
                    totalPoints: { $sum: '$points' },
                    correctAnswers: { $sum: { $cond: ['$isCorrect', 1, 0] } },
                    totalQuestions: { $sum: 1 },
                    averageTime: { $avg: '$timeTaken' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalPoints: 1,
                    correctAnswers: 1,
                    totalQuestions: 1,
                    averageTime: { $round: ['$averageTime', 2] },
                    accuracy: { $round: [{ $multiply: [{ $divide: ['$correctAnswers', '$totalQuestions'] }, 100] }, 2] }
                }
            }
        ]);

        if (userStats.length > 0) {
            res.json(userStats[0]);
        } else {
            // Return default stats if no answers found for the user
            res.json({
                totalPoints: 0,
                correctAnswers: 0,
                totalQuestions: 0,
                averageTime: 0,
                accuracy: 0
            });
        }
    } catch (error) {
        console.error(`[User Stats API] Error fetching user stats: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 