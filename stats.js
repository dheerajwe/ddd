const express = require('express');
const router = express.Router();
const Meet = require('../models/Meet');
const User = require('../models/User');

// Get dashboard statistics
router.get('/', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalQuestions = await Meet.aggregate([
      { $unwind: '$questions' },
      { $count: 'total' }
    ]);
    const activeMeets = await Meet.countDocuments({ status: 'active' });

    res.json({
      totalStudents,
      totalQuestions: totalQuestions[0]?.total || 0,
      activeMeets
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 