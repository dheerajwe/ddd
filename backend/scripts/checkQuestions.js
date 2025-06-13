const mongoose = require('mongoose');
const Meet = require('../models/Meet');
const Question = require('../models/Question');
require('dotenv').config();

async function checkQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all questions
    const questions = await Question.find({});
    console.log('\nAll Questions in Database:');
    console.log(JSON.stringify(questions, null, 2));

    // Get all meets with populated questions
    const meets = await Meet.find({}).populate('questions');
    console.log('\nAll Meets with Questions:');
    console.log(JSON.stringify(meets, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkQuestions(); 