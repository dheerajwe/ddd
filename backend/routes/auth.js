const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
    callbackURL: 'http://localhost:5000/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth callback received:', {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName
      });

      // Check if user exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        console.log('Creating new user...');
        // Create new user if doesn't exist
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0]?.value,
          role: 'student' // Default role
        });
        console.log('New user created:', user._id);
      } else {
        console.log('Existing user found:', user._id);
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Google strategy error:', error);
      return done(error, null);
    }
  }
));

// Serialize user for the session (needed for Google OAuth)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session (needed for Google OAuth)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Redirect to frontend with token
    res.redirect(`http://localhost:5173/student?token=${token}`);
  }
);

// Logout
router.get('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router; 