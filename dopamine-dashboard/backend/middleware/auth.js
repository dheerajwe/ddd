/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user information to requests
 * Used to protect routes that require authentication
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by ID
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user to request object
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Please authenticate' });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { auth, isAdmin }; 