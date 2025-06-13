// User.js
// User model schema definition and methods.
// Handles user data, authentication, and password management.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // User's email address (unique identifier)
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  
  // Hashed password
  password: {
    type: String,
    required: function() {
      return !this.isOAuth; // Password only required for non-OAuth users
    }
  },
  
  // User's role (student/teacher)
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true
  },
  
  // User's full name
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Password reset token and expiry
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // OAuth-related fields
  isOAuth: {
    type: Boolean,
    default: false
  },
  oauthProvider: {
    type: String,
    enum: ['google', null],
    default: null
  },
  
  // User's avatar
  avatar: {
    type: String,
    default: '/default-avatar.png'
  },
  
  // Stats fields
  totalScore: {
    type: Number,
    default: 0
  },
  totalMeets: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving (only for non-OAuth users)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isOAuth) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password (only for non-OAuth users)
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isOAuth) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 