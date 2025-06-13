const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  timeTaken: {
    type: Number,  
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  rank: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const leaderboardSchema = new mongoose.Schema({
  meet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meet',
    required: true
  },
  entries: [leaderboardEntrySchema]
}, { timestamps: true });

// Index for faster queries
leaderboardSchema.index({ meet: 1 });

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

module.exports = Leaderboard; 