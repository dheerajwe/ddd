const mongoose = require('mongoose');
const Question = require('../models/Question');
const Meet = require('../models/Meet');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const sampleQuestions = [
  {
    text: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    correctAnswer: 2, // Index of 'Paris' in options array
    points: 10,
    timeLimit: 600 // 10 minutes
  },
  {
    text: 'Which planet is known as the Red Planet?',
    options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
    correctAnswer: 1, // Index of 'Mars' in options array
    points: 10,
    timeLimit: 600 // 10 minutes
  },
  {
    text: 'What is the output of console.log(typeof [])?',
    options: ['array', 'object', 'undefined', 'null'],
    correctAnswer: 1, // Index of 'object' in options array
    points: 10,
    timeLimit: 600 // 10 minutes
  },
  {
    text: 'Which method is used to add elements to the end of an array?',
    options: ['push()', 'append()', 'add()', 'insert()'],
    correctAnswer: 0, // Index of 'push()' in options array
    points: 10,
    timeLimit: 600 // 10 minutes
  }
];

async function addQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a default meet if none exists
    let meet = await Meet.findOne();
    if (!meet) {
      meet = await Meet.create({
        title: 'Default Quiz',
        description: 'A collection of general knowledge questions',
        duration: 30,
        category: 'General Knowledge',
        time: '12:00 PM',
        difficulty: 'medium',
        date: new Date(),
        transcript: 'General knowledge quiz',
        status: 'active'
      });
      console.log('Created default meet');
    }

    // Add questions to the meet
    for (const question of sampleQuestions) {
      const newQuestion = await Question.create({
        ...question,
        meetId: meet._id
      });
      meet.questions.push(newQuestion._id);
    }
    await meet.save();

    console.log('Added sample questions to the database');
    process.exit(0);
  } catch (error) {
    console.error('Error adding questions:', error);
    process.exit(1);
  }
}

addQuestions(); 