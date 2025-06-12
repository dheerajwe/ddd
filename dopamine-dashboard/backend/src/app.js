// app.js
// Express application setup and middleware configuration.
// Handles CORS, request parsing, authentication, and route registration.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const meetRoutes = require('./routes/meetRoutes');
const quizRoutes = require('./routes/quiz');
const userRoutes = require('./routes/user');

// Import passport config
require('./config/passport');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
    'Cache-Control',
    'Pragma',
    'Expires',
    'X-CSRF-Token',
    'X-Requested-With',
    'Accept',
    'Accept-Version',
    'Content-Length',
    'Content-MD5',
    'Date',
    'X-Api-Version',
    'Cookie'
  ],
  exposedHeaders: ['Set-Cookie', 'Authorization', 'Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

// Apply CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Request logging
app.use(morgan('dev'));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'sessionId'
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Add cache control middleware
app.use((req, res, next) => {
  res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
console.log('Mounting /api/meets routes...');
app.use('/api/meets', meetRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dopamine-dashboard')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = app; 