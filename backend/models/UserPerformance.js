const mongoose = require('mongoose');

const userPerformanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meet',
    required: true
  },
  questionsAttempted: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedAnswer: String,
    isCorrect: Boolean,
    pointsEarned: Number,
    timeTaken: Number // in seconds
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  averageTimePerQuestion: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only have one performance record per meet
userPerformanceSchema.index({ userId: 1, meetId: 1 }, { unique: true });

module.exports = mongoose.model('UserPerformance', userPerformanceSchema); 