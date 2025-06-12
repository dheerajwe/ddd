const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    meetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meet',
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 10
    },
    timeLimit: {
        type: Number, // in seconds
        default: 30
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', questionSchema); 