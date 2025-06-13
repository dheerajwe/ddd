const mongoose = require('mongoose');
const Meet = require('../models/Meet');
const Question = require('../models/Question');
require('dotenv').config();

async function checkApiResponse() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all meets
    console.log('\nChecking GET /meets response:');
    const meets = await Meet.find()
      .populate({
        path: 'questions',
        model: 'Question',
        select: 'text options correctAnswer points timeLimit'
      })
      .lean();

    console.log('Meets response:', JSON.stringify(meets, null, 2));

    // Get a specific meet
    if (meets.length > 0) {
      const meetId = meets[0]._id;
      console.log('\nChecking GET /meets/:id response for meet:', meetId);
      
      const meet = await Meet.findById(meetId)
        .populate({
          path: 'questions',
          model: 'Question',
          select: 'text options correctAnswer points timeLimit'
        })
        .lean();

      console.log('Single meet response:', JSON.stringify(meet, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkApiResponse(); 