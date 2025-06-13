const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    selectedAnswer: {
        type: String,
        required: true
    },
    timeTaken: {
        type: Number,
        required: true 
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Answer', answerSchema); 