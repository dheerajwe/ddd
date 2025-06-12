const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

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

// Serialize user for the session
passport.serializeUser((user, done) => {
  console.log('Serializing user:', {
    userId: user._id,
    email: user.email,
    sessionID: user.sessionID
  });
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing user:', {
      userId: id,
      timestamp: new Date().toISOString()
    });
    
    const user = await User.findById(id);
    if (!user) {
      console.log('User not found during deserialization');
      return done(null, false);
    }
    console.log('User deserialized successfully:', {
      userId: user._id,
      email: user.email,
      timestamp: new Date().toISOString()
    });
    done(null, user);
  } catch (error) {
    console.error('Deserialization error:', error);
    done(error, null);
  }
});

// Get current user
router.get('/me', (req, res) => {
  console.log('GET /me request received', {
    hasUser: !!req.user,
    sessionID: req.sessionID,
    session: {
      cookie: req.session.cookie,
      createdAt: req.session.createdAt,
      expires: req.session.cookie.expires
    },
    headers: {
      cookie: req.headers.cookie,
      'user-agent': req.headers['user-agent']
    }
  });

  if (!req.user) {
    console.log('No user found in session');
    return res.status(401).json({ message: 'Not authenticated' });
  }
  console.log('Sending user data:', {
    userId: req.user._id,
    email: req.user.email,
    sessionID: req.sessionID
  });
  res.json(req.user);
});

// Google OAuth routes
router.get('/google',
  (req, res, next) => {
    console.log('Initiating Google OAuth...', {
      sessionID: req.sessionID,
      timestamp: new Date().toISOString()
    });
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  (req, res, next) => {
    console.log('Google OAuth callback received', {
      sessionID: req.sessionID,
      timestamp: new Date().toISOString()
    });
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:5173/login',
    successRedirect: 'http://localhost:5173/student'
  })
);

// Logout
router.get('/logout', (req, res) => {
  console.log('Logout request received', {
    hasUser: !!req.user,
    sessionID: req.sessionID,
    session: {
      cookie: req.session.cookie,
      createdAt: req.session.createdAt,
      expires: req.session.cookie.expires
    }
  });

  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ message: 'Error logging out' });
    }
    console.log('User logged out, destroying session');
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Error destroying session' });
      }
      console.log('Session destroyed, clearing cookie');
      res.clearCookie('sessionId');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

module.exports = router; 