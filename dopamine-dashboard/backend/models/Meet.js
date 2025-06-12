/**
 * Meet/Quiz Model
 * Defines the schema for quizzes/meets in the application
 * Includes fields for quiz details, questions, and leaderboard
 */

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number,
        required: true
    }
});

const meetSchema = new mongoose.Schema({
    // Basic quiz information
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true,
        min: 1
    },
    category: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'hard']
    },
    transcript: {
        type: String,
        required: true
    },

    // Quiz questions and answers
    questions: [questionSchema],

    // Quiz status and participants
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed'],
        default: 'upcoming'
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Leaderboard tracking
    leaderboard: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        score: {
            type: Number,
            default: 0
        },
        timeTaken: {
            type: Number,
            default: 0
        },
        answers: [{
            questionIndex: Number,
            selectedAnswer: String,
            isCorrect: Boolean
        }],
        submittedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for efficient querying
meetSchema.index({ date: -1 });
meetSchema.index({ category: 1 });
meetSchema.index({ status: 1 });

module.exports = mongoose.model('Meet', meetSchema); 