const mongoose = require('mongoose');
const Meet = require('../models/Meet');
const Question = require('../models/Question');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const meetsData = [
  {
    meetId: 'meet-001',
    title: 'Introduction to React Hooks',
    category: 'Web Development',
    time: '10:00 AM',
    participants: 25,
    difficulty: 'Medium',
    date: new Date(Date.now() + 3600000), // 1 hour from now
    transcript: 'Learn about useState, useEffect, and other React Hooks with practical examples.',
    status: 'active',
    questions: [
      {
        questionText: 'What is the main purpose of useState hook?',
        options: [
          'To manage side effects',
          'To handle state in functional components',
          'To create class components',
          'To handle routing'
        ],
        correctAnswer: 'To handle state in functional components',
        points: 10,
        timeLimit: 30
      },
      {
        questionText: 'Which hook is used for side effects?',
        options: [
          'useState',
          'useEffect',
          'useContext',
          'useReducer'
        ],
        correctAnswer: 'useEffect',
        points: 10,
        timeLimit: 30
      }
    ]
  },
  {
    meetId: 'meet-002',
    title: 'Advanced JavaScript Concepts',
    category: 'Programming',
    time: '2:00 PM',
    participants: 18,
    difficulty: 'Hard',
    date: new Date(Date.now() + 7200000), // 2 hours from now
    transcript: 'Deep dive into closures, promises, and async/await patterns.',
    status: 'active',
    questions: [
      {
        questionText: 'What is a closure in JavaScript?',
        options: [
          'A function that returns another function',
          'A way to close a program',
          'A method to handle errors',
          'A type of loop'
        ],
        correctAnswer: 'A function that returns another function',
        points: 15,
        timeLimit: 45
      },
      {
        questionText: 'Which of these is not a JavaScript data type?',
        options: [
          'Boolean',
          'Integer',
          'String',
          'Object'
        ],
        correctAnswer: 'Integer',
        points: 10,
        timeLimit: 30
      }
    ]
  },
  {
    meetId: 'meet-003',
    title: 'System Design Fundamentals',
    category: 'Software Architecture',
    time: '11:00 AM',
    participants: 30,
    difficulty: 'Hard',
    date: new Date(Date.now() - 3600000), // 1 hour ago
    transcript: 'Learn about scalable architecture and design patterns.',
    status: 'completed',
    questions: [
      {
        questionText: 'What is the main goal of system design?',
        options: [
          'To make code more readable',
          'To create scalable and maintainable systems',
          'To reduce development time',
          'To increase code complexity'
        ],
        correctAnswer: 'To create scalable and maintainable systems',
        points: 15,
        timeLimit: 45
      },
      {
        questionText: 'Which is not a common design pattern?',
        options: [
          'Singleton',
          'Observer',
          'Loopback',
          'Factory'
        ],
        correctAnswer: 'Loopback',
        points: 10,
        timeLimit: 30
      }
    ]
  },
  {
    meetId: 'meet-004',
    title: 'Machine Learning Basics',
    category: 'Data Science',
    time: '3:30 PM',
    participants: 42,
    difficulty: 'Hard',
    date: new Date(Date.now() + 10800000),
    transcript: 'Introduction to machine learning algorithms and concepts.',
    status: 'active',
    questions: [
      {
        questionText: 'What is supervised learning?',
        options: ['Learning without labels', 'Learning with labeled data', 'Learning from rewards', 'Learning from mistakes'],
        correctAnswer: 'Learning with labeled data',
        points: 20,
        timeLimit: 60
      }
    ]
  },
  {
    meetId: 'meet-005',
    title: 'UI/UX Design Principles',
    category: 'Design',
    time: '1:00 PM',
    participants: 28,
    difficulty: 'Medium',
    date: new Date(Date.now() - 7200000),
    transcript: 'Learn essential UI/UX design principles and best practices.',
    status: 'completed',
    questions: [
      {
        questionText: 'What is the golden ratio in design?',
        options: ['1:1.618', '1:2', '2:3', '3:4'],
        correctAnswer: '1:1.618',
        points: 10,
        timeLimit: 30
      }
    ]
  },
  {
    meetId: 'meet-006',
    title: 'Cloud Computing Essentials',
    category: 'DevOps',
    time: '4:00 PM',
    participants: 35,
    difficulty: 'Medium',
    date: new Date(Date.now() + 14400000),
    transcript: 'Understanding cloud services and deployment strategies.',
    status: 'active',
    questions: [
      {
        questionText: 'What is serverless computing?',
        options: ['Running without servers', 'Pay-per-use cloud computing', 'Local server deployment', 'Traditional hosting'],
        correctAnswer: 'Pay-per-use cloud computing',
        points: 15,
        timeLimit: 45
      }
    ]
  },
  {
    meetId: 'meet-007',
    title: 'Mobile App Development',
    category: 'Mobile',
    time: '9:30 AM',
    participants: 22,
    difficulty: 'Medium',
    date: new Date(Date.now() - 14400000),
    transcript: 'Building cross-platform mobile applications.',
    status: 'completed',
    questions: [
      {
        questionText: 'What is React Native?',
        options: ['A web framework', 'A mobile development framework', 'A database', 'A design tool'],
        correctAnswer: 'A mobile development framework',
        points: 10,
        timeLimit: 30
      }
    ]
  },
  {
    meetId: 'meet-008',
    title: 'Cybersecurity Fundamentals',
    category: 'Security',
    time: '2:30 PM',
    participants: 45,
    difficulty: 'Hard',
    date: new Date(Date.now() + 18000000),
    transcript: 'Essential cybersecurity concepts and practices.',
    status: 'active',
    questions: [
      {
        questionText: 'What is a firewall?',
        options: ['A physical barrier', 'A network security device', 'A type of virus', 'A backup system'],
        correctAnswer: 'A network security device',
        points: 15,
        timeLimit: 45
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

addMeetsAndQuestions().catch(console.error); 