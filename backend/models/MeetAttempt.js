const mongoose = require('mongoose');

const meetAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meet',
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    selectedOption: Number,
    isCorrect: Boolean,
    timeTaken: Number 
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
meetAttemptSchema.index({ user: 1, meet: 1 });
meetAttemptSchema.index({ endTime: -1 });

module.exports = mongoose.model('MeetAttempt', meetAttemptSchema); 