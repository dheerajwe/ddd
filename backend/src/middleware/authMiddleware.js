// authMiddleware.js
// Authentication middleware for protecting routes and managing user sessions.
// Handles JWT verification, role-based access control, and session validation.

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Then check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('No token found in request:', {
        cookies: req.cookies,
        headers: req.headers,
        path: req.path
      });
      return res.status(401).json({ 
        message: 'Not authorized, no token',
        error: 'AUTH_REQUIRED'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);
      console.log('Token verified:', {
        userId: decoded.userId,
        path: req.path
      });

      // Get user from token
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        console.log('User not found for token:', {
          userId: decoded.userId,
          path: req.path
        });
        return res.status(401).json({ 
          message: 'Not authorized, user not found',
          error: 'USER_NOT_FOUND'
        });
      }

      // Update last activity
      user.lastActivity = new Date();
      await user.save();

      // Set user in request
      req.user = user;

      // Set CORS headers for the response
      res.set('Access-Control-Allow-Credentials', 'true');
      res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, Cache-Control, Pragma, Expires');

      next();
    } catch (error) {
      console.error('Token verification failed:', {
        error: error.message,
        path: req.path
      });
      return res.status(401).json({ 
        message: 'Not authorized, token failed',
        error: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', {
      error: error.message,
      path: req.path
    });
    res.status(500).json({ 
      message: 'Server error',
      error: 'SERVER_ERROR'
    });
  }
};

// Role-based access control
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }
    next();
  };
};

// Error handling middleware
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
}; 