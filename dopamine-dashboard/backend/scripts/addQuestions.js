const mongoose = require('mongoose');
const Meet = require('../models/Meet');
const Question = require('../models/Question');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const questionsForMeet1 = [
  {
    questionText: 'What is the capital of France?',
    correctAnswer: 'Paris',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    points: 10,
    timeLimit: 30
  },
  {
    questionText: 'Which planet is known as the Red Planet?',
    correctAnswer: 'Mars',
    options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
    points: 10,
    timeLimit: 30
  }
];

const questionsForMeet2 = [
  {
    questionText: 'What is the output of console.log(typeof [])?',
    correctAnswer: 'object',
    options: ['array', 'object', 'undefined', 'null'],
    points: 10,
    timeLimit: 30
  },
  {
    questionText: 'Which method is used to add elements to the end of an array?',
    correctAnswer: 'push()',
    options: ['push()', 'append()', 'add()', 'insert()'],
    points: 10,
    timeLimit: 30
  }
];

async function addQuestions() {
  await mongoose.connect(MONGODB_URI);
  const meets = await Meet.find();
  console.log('Found meets:', meets.map(m => ({_id: m._id, meetId: m.meetId, title: m.title})));
  const meet1 = meets[0];
  const meet2 = meets[1];
  if (!meet1 || !meet2) {
    console.error('Could not find two meets in the database.');
    process.exit(1);
  }
  // Add questions to Meet 1
  for (const q of questionsForMeet1) {
    const question = await Question.create({ ...q, meetId: meet1._id });
    meet1.questions.push(question._id);
  }
  await meet1.save();
  // Add questions to Meet 2
  for (const q of questionsForMeet2) {
    const question = await Question.create({ ...q, meetId: meet2._id });
    meet2.questions.push(question._id);
  }
  await meet2.save();
  console.log('Questions added to Meet 1 and Meet 2.');
  process.exit(0);
}

addQuestions().catch(err => { console.error(err); process.exit(1); }); 