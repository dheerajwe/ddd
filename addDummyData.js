const mongoose = require('mongoose');
const User = require('../models/User');
const Meet = require('../models/Meet');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Stat = require('../models/Stat');
require('dotenv').config();

// Global meets that are available to all users
const dummyMeets = [
  {
    meetId: 'MEET001',
    title: 'Introduction to JavaScript',
    description: 'Learn the basics of JavaScript programming',
    category: 'Programming',
    time: '10:00 AM',
    participants: 0, // Will be updated as users join
    difficulty: 'Easy',
    date: new Date('2024-03-15'),
    duration: 60, // 60 minutes
    transcript: 'Welcome to Introduction to JavaScript. Today we will cover the basics of JavaScript programming including variables, data types, and control structures.',
    status: 'completed'
  },
  {
    meetId: 'MEET002',
    title: 'Advanced React Patterns',
    description: 'Deep dive into React hooks and patterns',
    category: 'Web Development',
    time: '2:00 PM',
    participants: 0,
    difficulty: 'Medium',
    date: new Date('2024-03-20'),
    duration: 45, // 45 minutes
    transcript: 'Welcome to Advanced React Patterns. In this session, we will explore advanced React concepts including custom hooks, context API, and performance optimization.',
    status: 'completed'
  },
  {
    meetId: 'MEET003',
    title: 'Node.js Backend Development',
    description: 'Building RESTful APIs with Node.js',
    category: 'Backend Development',
    time: '11:00 AM',
    participants: 0,
    difficulty: 'Hard',
    date: new Date('2024-03-25'),
    duration: 90, // 90 minutes
    transcript: 'Welcome to Node.js Backend Development. Today we will learn how to build scalable RESTful APIs using Node.js and Express.',
    status: 'upcoming'
  }
];

// Questions for each meet
const dummyQuestions = {
  MEET001: [
    {
      questionText: 'What is the difference between let and const in JavaScript?',
      options: ['let is mutable, const is immutable', 'let is for numbers, const is for strings', 'No difference', 'let is for variables, const is for functions'],
      correctAnswer: 'let is mutable, const is immutable',
      points: 10,
      timeLimit: 30
    },
    {
      questionText: 'Which of the following is not a JavaScript data type?',
      options: ['String', 'Boolean', 'Float', 'Object'],
      correctAnswer: 'Float',
      points: 10,
      timeLimit: 30
    },
    {
      questionText: 'What is the purpose of the "use strict" directive?',
      options: ['To enable strict mode', 'To disable strict mode', 'To enable debugging', 'To disable debugging'],
      correctAnswer: 'To enable strict mode',
      points: 15,
      timeLimit: 45
    }
  ],
  MEET002: [
    {
      questionText: 'Which hook is used for side effects in React?',
      options: ['useState', 'useEffect', 'useContext', 'useReducer'],
      correctAnswer: 'useEffect',
      points: 10,
      timeLimit: 30
    },
    {
      questionText: 'What is the purpose of React.memo?',
      options: ['To memoize components', 'To memoize functions', 'To memoize state', 'To memoize props'],
      correctAnswer: 'To memoize components',
      points: 15,
      timeLimit: 45
    },
    {
      questionText: 'Which of the following is not a React Hook?',
      options: ['useState', 'useEffect', 'useComponent', 'useContext'],
      correctAnswer: 'useComponent',
      points: 10,
      timeLimit: 30
    }
  ],
  MEET003: [
    {
      questionText: 'What is the purpose of middleware in Express.js?',
      options: ['To handle HTTP requests', 'To connect to databases', 'To serve static files', 'To handle authentication'],
      correctAnswer: 'To handle HTTP requests',
      points: 10,
      timeLimit: 30
    },
    {
      questionText: 'Which of the following is not a valid HTTP method in Express?',
      options: ['GET', 'POST', 'FETCH', 'DELETE'],
      correctAnswer: 'FETCH',
      points: 10,
      timeLimit: 30
    },
    {
      questionText: 'What is the purpose of the next() function in Express middleware?',
      options: ['To pass control to the next middleware', 'To end the request-response cycle', 'To handle errors', 'To validate requests'],
      correctAnswer: 'To pass control to the next middleware',
      points: 15,
      timeLimit: 45
    }
  ]
};

async function addDummyData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Add meets with embedded questions
    for (const dummyMeet of dummyMeets) {
      const questionsToAdd = dummyQuestions[dummyMeet.meetId].map(q => ({
        text: q.questionText,
        options: q.options,
        correctAnswer: q.options.indexOf(q.correctAnswer) // Convert correct answer text to index
      }));

      const newMeet = new Meet({
        meetId: dummyMeet.meetId,
        title: dummyMeet.title,
        description: dummyMeet.description,
        category: dummyMeet.category,
        time: dummyMeet.time,
        participants: dummyMeet.participants,
        difficulty: dummyMeet.difficulty,
        date: dummyMeet.date,
        duration: dummyMeet.duration,
        transcript: dummyMeet.transcript,
        status: dummyMeet.status,
        questions: questionsToAdd,
      });
      await newMeet.save();
      console.log(`Added meet '${newMeet.title}' with ${newMeet.questions.length} questions.`);
    }

    // Clear existing data (keeping for safety, though questions will be embedded now)
    await Question.deleteMany({}); // Delete standalone Question documents
    await Answer.deleteMany({});
    await Stat.deleteMany({});
    console.log('Cleared existing data (excluding Meets with embedded questions)');

    console.log('All dummy data added successfully!');
  } catch (error) {
    console.error('Error adding dummy data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addDummyData(); 