const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Meet = require('../models/Meet');
const Question = require('../models/Question');

// Create a new meet (Admin only - temporarily removed isAdmin check)
router.post('/', auth, async (req, res) => {
    try {
        const { meetId, date, transcript } = req.body;
        
        const meet = await Meet.create({
            meetId,
            date,
            transcript,
            status: 'pending'
        });

        res.status(201).json(meet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all meets
router.get('/', auth, async (req, res) => {
    try {
        const meets = await Meet.find()
            .populate('questions')
            .sort({ date: -1 });
        res.json(meets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific meet by meetId (no auth needed for now)
router.get('/:id', async (req, res) => {
    try {
        const meet = await Meet.findOne({ meetId: req.params.id }).populate('questions');
        if (!meet) {
            return res.status(404).json({ message: 'Meet not found' });
        }
        res.json(meet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update meet status (Admin only - temporarily removed isAdmin check)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const meet = await Meet.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!meet) {
            return res.status(404).json({ error: 'Meet not found' });
        }
        
        res.json(meet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add questions to meet (Admin only - temporarily removed isAdmin check)
router.post('/:id/questions', auth, async (req, res) => {
    try {
        const { questions } = req.body;
        const meet = await Meet.findById(req.params.id);
        
        if (!meet) {
            return res.status(404).json({ error: 'Meet not found' });
        }

        const createdQuestions = await Question.insertMany(
            questions.map(q => ({
                ...q,
                meetId: meet._id
            }))
        );

        meet.questions.push(...createdQuestions.map(q => q._id));
        await meet.save();

        res.status(201).json(createdQuestions);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 