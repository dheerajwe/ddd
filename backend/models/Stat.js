const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalMeetsAttended: {
    type: Number,
    default: 0
  },
  totalQuestionsAttempted: {
    type: Number,
    default: 0
  },
  totalCorrectAnswers: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  categoryPerformance: {
    type: Map,
    of: {
      totalQuestions: Number,
      correctAnswers: Number,
      averageScore: Number
    },
    default: new Map()
  },
  meetHistory: [{
    meetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meet'
    },
    date: Date,
    score: Number,
    questionsAttempted: Number,
    correctAnswers: Number,
    timeSpent: Number // in minu
  }],
  achievements: [{
    name: String,
    description: String,
    earnedAt: Date
  }],
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to update stats based on new performance
statSchema.methods.updateStats = async function(performance) {
  // Update basic stats
  this.totalMeetsAttended += 1;
  this.totalQuestionsAttempted += performance.totalQuestions;
  this.totalCorrectAnswers += performance.correctAnswers;
  this.averageScore = (this.averageScore * (this.totalMeetsAttended - 1) + performance.totalScore) / this.totalMeetsAttended;

  // Update meet history
  this.meetHistory.push({
    meetId: performance.meetId,
    date: performance.completedAt,
    score: performance.totalScore,
    questionsAttempted: performance.totalQuestions,
    correctAnswers: performance.correctAnswers,
    timeSpent: performance.questionsAttempted.reduce((acc, q) => acc + q.timeTaken, 0) / 60 // Convert to minutes
  });

  // Update last active
  this.lastActive = new Date();

  // Update streak
  const lastActiveDate = new Date(this.lastActive);
  const today = new Date();
  const diffDays = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) {
    this.currentStreak += 1;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  } else {
    this.currentStreak = 1;
  }

  await this.save();
};

module.exports = mongoose.model('Stat', statSchema); 