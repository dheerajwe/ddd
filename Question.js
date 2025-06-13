const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    meetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meet',
        required: true
    },
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
        required: true,
        min: 0
    },
    points: {
        type: Number,
        default: 10
    },
    timeLimit: {
        type: Number, 
        default: 600 // 10 minutes
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', questionSchema); 