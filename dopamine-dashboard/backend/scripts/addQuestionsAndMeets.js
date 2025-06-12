const mongoose = require('mongoose');
const Meet = require('../models/Meet');
const Question = require('../models/Question');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const meetsData = [
  {
    meetId: 'meet1',
    title: 'Weekly Marketing Sync',
    category: 'Marketing',
    time: '10:00 AM',
    participants: 25,
    difficulty: 'Medium',
    date: new Date('2024-07-10T10:00:00Z'),
    transcript: 'Transcript for Weekly Marketing Sync',
    status: 'active',
    questions: [
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
    ]
  },
  {
    meetId: 'meet2',
    title: 'Q3 Product Review',
    category: 'Product',
    time: '02:00 PM',
    participants: 18,
    difficulty: 'Hard',
    date: new Date('2024-07-12T14:30:00Z'),
    transcript: 'Transcript for Q3 Product Review',
    status: 'active',
    questions: [
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
    ]
  }
];

async function addMeetsAndQuestions() {
  await mongoose.connect(MONGODB_URI);
  for (const meetData of meetsData) {
    let meet = await Meet.findOne({ meetId: meetData.meetId });
    if (!meet) {
      meet = await Meet.create({
        meetId: meetData.meetId,
        title: meetData.title,
        category: meetData.category,
        time: meetData.time,
        participants: meetData.participants,
        difficulty: meetData.difficulty,
        date: meetData.date,
        transcript: meetData.transcript,
        status: meetData.status
      });
      console.log('Created meet:', meet.meetId);
    } else {
      // Update missing fields if needed
      let updated = false;
      ['title', 'category', 'time', 'participants', 'difficulty', 'date', 'transcript', 'status'].forEach(field => {
        if (meet[field] !== meetData[field]) {
          meet[field] = meetData[field];
          updated = true;
        }
      });
      if (updated) {
        await meet.save();
        console.log('Updated meet:', meet.meetId);
      } else {
        console.log('Meet already exists:', meet.meetId);
      }
    }
    for (const q of meetData.questions) {
      // Avoid duplicate questions
      const exists = await Question.findOne({ questionText: q.questionText, meetId: meet._id });
      if (!exists) {
        const question = await Question.create({ ...q, meetId: meet._id });
        meet.questions.push(question._id);
        console.log(`Added question to ${meet.meetId}:`, q.questionText);
      }
    }
    await meet.save();
  }
  console.log('Meets and questions ensured.');
  process.exit(0);
}

addMeetsAndQuestions().catch(err => { console.error(err); process.exit(1); }); 