// passport.js
// Passport.js configuration for authentication strategies.
// Implements local and Google OAuth authentication.

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const config = require('./config');

// Local strategy for email/password authentication
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Invalid credentials' });
      }
      
      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid credentials' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth strategy
passport.use(new GoogleStrategy(
  {
    clientID: config.googleClientId,
    clientSecret: config.googleClientSecret,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        // Create new user if doesn't exist
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          isOAuth: true
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
}); 