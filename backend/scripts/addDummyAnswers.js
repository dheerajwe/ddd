const mongoose = require('mongoose');
const Answer = require('../models/Answer');
const User = require('../models/User');
const Meet = require('../models/Meet');
const Question = require('../models/Question');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function addDummyAnswers() {
  await mongoose.connect(MONGODB_URI);

  // Find the meet and its questions
  const meet = await Meet.findOne({ meetId: 'meet1' }).populate('questions');
  if (!meet) {
    console.log('Meet not found');
    process.exit(1);
  }

  // Create dummy users if not exist
  const users = [
    { name: 'Alice', email: 'alice@example.com', role: 'student', googleId: 'dummy_google_id_alice' },
    { name: 'Bob', email: 'bob@example.com', role: 'student', googleId: 'dummy_google_id_bob' },
    { name: 'Charlie', email: 'charlie@example.com', role: 'student', googleId: 'dummy_google_id_charlie' }
  ];
  const userDocs = [];
  for (const u of users) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create(u);
    }
    userDocs.push(user);
  }

  // Add answers for each user and question
  for (const user of userDocs) {
    for (const question of meet.questions) {
      // Avoid adding duplicate answers for the same user and question in this script run
      const existingAnswer = await Answer.findOne({
        userId: user._id,
        questionId: question._id
      });

      if (!existingAnswer) {
        await Answer.create({
          userId: user._id,
          questionId: question._id,
          selectedAnswer: question.options[0], // Can make this smarter for correctness
          timeTaken: Math.floor(Math.random() * 20) + 5, // 5-25 seconds
          isCorrect: Math.random() > 0.3, // 70% correct
          points: 10
        });
      }
    }
  }

  console.log('Dummy answers added!');
  process.exit(0);
}

addDummyAnswers().catch(err => { console.error(err); process.exit(1); }); 