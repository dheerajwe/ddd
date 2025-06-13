const mongoose = require('mongoose');
const Meet = require('../models/Meet');
const Question = require('../models/Question');
require('dotenv').config();

const dummyMeets = [
  {
    title: 'Introduction to React Hooks',
    description: 'Learn about useState, useEffect, and other React Hooks with practical examples.',
    category: 'Web Development',
    time: '10:00 AM',
    duration: 60,
    difficulty: 'medium',
    date: new Date(Date.now() + 3600000), // 1 hour from now
    transcript: 'Learn about useState, useEffect, and other React Hooks with practical examples.',
    status: 'upcoming'
  },
  {
    title: 'Advanced JavaScript Concepts',
    description: 'Deep dive into closures, promises, and async/await.',
    category: 'Programming',
    time: '2:00 PM',
    duration: 90,
    difficulty: 'hard',
    date: new Date(Date.now() + 7200000), // 2 hours from now
    transcript: 'Deep dive into closures, promises, and async/await.',
    status: 'upcoming'
  }
];

const dummyQuestions = {
  'Introduction to React Hooks': [
    {
      text: 'What is the main purpose of useState hook?',
      options: [
        'To manage side effects',
        'To handle state in functional components',
        'To create class components',
        'To handle routing'
      ],
      correctAnswer: 1, // Index of correct answer
      points: 10,
      timeLimit: 30
    },
    {
      text: 'Which hook is used for side effects?',
      options: [
        'useState',
        'useEffect',
        'useContext',
        'useReducer'
      ],
      correctAnswer: 1,
      points: 10,
      timeLimit: 30
    }
  ],
  'Advanced JavaScript Concepts': [
    {
      text: 'What is a closure in JavaScript?',
      options: [
        'A function that returns another function',
        'A function that has access to variables from its outer scope',
        'A way to close a browser window',
        'A method to terminate a program'
      ],
      correctAnswer: 1,
      points: 15,
      timeLimit: 45
    },
    {
      text: 'Which of these is NOT a valid way to create a Promise?',
      options: [
        'new Promise((resolve, reject) => {})',
        'Promise.resolve()',
        'Promise.reject()',
        'Promise.create()'
      ],
      correctAnswer: 3,
      points: 15,
      timeLimit: 45
    }
  ]
};

async function addDummyDataWithRefs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Meet.deleteMany({});
    await Question.deleteMany({});
    console.log('Cleared existing data');

    // Add meets and their questions
    for (const meetData of dummyMeets) {
      // Create the meet first
      const meet = await Meet.create({
        ...meetData,
        questions: [] // Initialize empty questions array
      });
      console.log(`Created meet: ${meet.title}`);

      // Get questions for this meet
      const questionsForMeet = dummyQuestions[meet.title];
      
      // Create questions and link them to the meet
      const questionIds = [];
      for (const questionData of questionsForMeet) {
        const question = await Question.create({
          ...questionData,
          meetId: meet._id
        });
        
        questionIds.push(question._id);
        console.log(`Added question to ${meet.title}: ${question.text}`);
      }

      // Update meet with question references
      meet.questions = questionIds;
      await meet.save();
      
      // Verify the update
      const updatedMeet = await Meet.findById(meet._id).populate('questions');
      console.log(`Verified meet ${meet.title} has ${updatedMeet.questions.length} questions`);
    }

    // Verify all data was added correctly
    const allMeets = await Meet.find().populate('questions');
    console.log('\nVerification:');
    for (const meet of allMeets) {
      console.log(`\nMeet: ${meet.title}`);
      console.log(`Questions count: ${meet.questions.length}`);
      meet.questions.forEach((q, index) => {
        console.log(`Question ${index + 1}: ${q.text}`);
        console.log(`Options: ${q.options.join(', ')}`);
        console.log(`Correct Answer: ${q.correctAnswer}`);
        console.log(`Points: ${q.points}`);
        console.log(`Time Limit: ${q.timeLimit}s`);
      });
    }

    console.log('\nAll dummy data added successfully!');
  } catch (error) {
    console.error('Error adding dummy data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addDummyDataWithRefs(); 