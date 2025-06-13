const mongoose = require('mongoose');
const Meet = require('../models/Meet');
const Question = require('../models/Question');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const reactHooksQuestions = [
  {
    text: 'What is the purpose of the useState Hook?',
    options: [
      'To manage side effects in functional components',
      'To handle state in functional components',
      'To create class components',
      'To handle routing in React'
    ],
    correctAnswer: 1,
    points: 10,
    timeLimit: 30
  },
  {
    text: 'Which Hook is used for handling side effects in React?',
    options: [
      'useState',
      'useEffect',
      'useContext',
      'useReducer'
    ],
    correctAnswer: 1,
    points: 10,
    timeLimit: 30
  },
  {
    text: 'What is the correct way to update state using useState?',
    options: [
      'state = newValue',
      'setState(newValue)',
      'this.setState(newValue)',
      'useState(newValue)'
    ],
    correctAnswer: 1,
    points: 15,
    timeLimit: 45
  }
];

async function addSampleQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the React Hooks meet
    const meet = await Meet.findOne({ title: 'Introduction to React Hooks' });
    if (!meet) {
      console.error('Could not find the React Hooks meet');
      process.exit(1);
    }

    console.log('Found meet:', meet._id);

    // Initialize questions array if it doesn't exist
    if (!meet.questions) {
      meet.questions = [];
    }

    // Add questions to the meet
    for (const q of reactHooksQuestions) {
      const question = await Question.create({
        ...q,
        meetId: meet._id
      });
      meet.questions.push(question._id);
    }

    await meet.save();
    console.log('Questions added successfully');

    // Verify the questions were added
    const updatedMeet = await Meet.findById(meet._id).populate('questions');
    console.log('Updated meet with questions:', {
      id: updatedMeet._id,
      title: updatedMeet.title,
      questionsCount: updatedMeet.questions.length,
      questions: updatedMeet.questions
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addSampleQuestions(); 