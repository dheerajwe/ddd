// Quiz.jsx
// Handles the quiz-taking experience for students, including question navigation, answer submission, and leaderboard updates.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../utils/axios';  // Use the configured axios instance
import { useAuth } from '../../contexts/AuthContext';
import './Quiz.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@mui/material';
import { CircularProgress, Typography, Button, Box, Paper, Grid, List, ListItem, ListItemText } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { EmojiEvents, AccessTime } from '@mui/icons-material'; // Corrected import

// Dummy users for the leaderboard
const DUMMY_USERS = [
  { name: 'Alex Johnson', score: 85 },
  { name: 'Sarah Smith', score: 82 },
  { name: 'Mike Brown', score: 78 },
  { name: 'Emma Wilson', score: 75 },
  { name: 'John Davis', score: 70 }
];

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  const [meet, setMeet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // Default to 10 minutes (600 seconds)
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Initialize loading to true
  const [leaderboard, setLeaderboard] = useState([]);

  // Consolidated dummy users for initial leaderboard display. Ensure unique `userId`s.
  const DUMMY_USERS = [
    { userId: 'dummy1', name: 'Alice Smith', score: 85, timeTaken: 450 },
    { userId: 'dummy2', name: 'Bob Johnson', score: 78, timeTaken: 520 },
    { userId: 'dummy3', name: 'Emma Wilson', score: 92, timeTaken: 380 },
    { userId: 'dummy4', name: 'Michael Brown', score: 70, timeTaken: 600 },
    { userId: 'dummy5', name: 'Sarah Davis', score: 95, timeTaken: 300 },
    { userId: 'dummy6', name: 'David Lee', score: 88, timeTaken: 410 },
  ];

  // currentQuestion must be derived inside the component to react to state changes
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const fetchMeetAndQuestions = async () => {
      try {
        setLoading(true); // Set loading to true at the start of fetch
        const meetResponse = await axios.get(`/api/meets/${id}`);
        setMeet(meetResponse.data);

        const questionsResponse = await axios.get('/api/meets/questions/all');
        setQuestions(questionsResponse.data);
        setTimeLeft(600);
        setQuizStarted(true);

        // Initialize leaderboard with dummy data and current user if available
        let initialLeaderboard = [...DUMMY_USERS]; // Use the consolidated DUMMY_USERS
        if (user && user._id) {
          // Add current user if not already in dummy data
          if (!initialLeaderboard.some(entry => entry.userId === user._id)) {
            initialLeaderboard.push({ userId: user._id, name: user.name, score: 0, timeTaken: 0 });
          }
        }
        setLeaderboard(initialLeaderboard.sort((a, b) => b.score - a.score));
        setLoading(false); // Set loading to false on successful fetch

      } catch (err) {
        console.error('Error fetching meet or questions:', err);
        setError('Failed to load quiz. Please try again.');
        setLoading(false); // Set loading to false on error as well
      }
    };
    fetchMeetAndQuestions();
  }, [id, user]);

  useEffect(() => {
    if (quizStarted && !quizEnded && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0 && quizStarted && !quizEnded) {
      handleQuizEnd();
    }
  }, [quizStarted, quizEnded, timeLeft, meet]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleAnswer = (selectedOptionIndex) => {
    if (selectedOption !== null) return; // Prevent multiple selections

    const isCorrect = selectedOptionIndex === currentQuestion.correctAnswer;
    const points = currentQuestion.points || 10; // Default to 10 points if not specified
    const newScore = isCorrect ? score + points : score;
    setScore(newScore);
    setSelectedOption(selectedOptionIndex);
    setShowFeedback(true);
    setFeedbackType(isCorrect ? 'correct' : 'incorrect');

    const timeTakenSoFar = (meet?.duration * 60 || 600) - timeLeft;
    let updatedLeaderboard = [...leaderboard];

    // Update existing user entry or add new one
    if (user && user._id) {
      const userIndex = updatedLeaderboard.findIndex(entry => entry.userId === user._id);
      if (userIndex > -1) {
        updatedLeaderboard[userIndex] = { ...updatedLeaderboard[userIndex], score: newScore, timeTaken: timeTakenSoFar };
      } else {
        updatedLeaderboard.push({ userId: user._id, name: user.name, score: newScore, timeTaken: timeTakenSoFar });
      }
    }

    // Sort the leaderboard
    updatedLeaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTaken - b.timeTaken;
    });

    setLeaderboard(updatedLeaderboard);

    // Show feedback briefly then move to next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        handleQuizEnd();
      }
    }, 500); // Show feedback for 500ms
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      handleQuizEnd();
    }
  };

  const handleQuizEnd = async () => {
    setQuizEnded(true);
    try {
      const response = await axios.post(`/api/meets/${id}/submit`, {
        score,
        timeTaken: (meet?.duration * 60 || 600) - timeLeft,
        answers: [] // Adjust this if backend expects full answers array
      });

      if (response.data.leaderboard) {
        setLeaderboard(response.data.leaderboard);
      }
    } catch (error) {
      console.error('Error submitting quiz results:', error);
      setError('Failed to submit quiz results. Please try again.');
    }
  };

  if (quizEnded) {
    const totalQuestions = questions.length;
    const correctAnswers = Math.floor(score / 10);
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const timeTaken = (meet?.duration * 60 || 600) - timeLeft;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    return (
      <div className="quiz-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '2rem'
      }}>
        <Paper elevation={3} sx={{
          p: 4,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          maxWidth: '800px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}>
          {/* Completion Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              textAlign: 'center',
              padding: '2rem'
            }}
          >
            <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 700, mb: 2 }}>
              Quiz Completed! 🎉
            </Typography>
            <Typography variant="h6" sx={{ color: '#7f8c8d', mb: 3 }}>
              Great job, {user?.name || 'Student'}!
            </Typography>
          </motion.div>

          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: '15px',
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                color: 'white'
              }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Score</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{score}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: '15px',
                background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                color: 'white'
              }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Accuracy</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{accuracy}%</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: '15px',
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                color: 'white'
              }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Time Taken</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {minutes}:{seconds < 10 ? '0' : ''}{seconds}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: '15px',
                background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                color: 'white'
              }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Questions</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{totalQuestions}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Return Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/student/dashboard"
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(52, 152, 219, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Return to Dashboard
            </Button>
          </Box>
        </Paper>
      </div>
    );
  }

  if (loading) {
    return <div className="quiz-loading"><CircularProgress /> <Typography>Loading Quiz...</Typography></div>;
  }

  if (error) {
    return <div className="quiz-container"><Typography color="error">{error}</Typography></div>;
  }

  if (!meet || questions.length === 0 || !currentQuestion) {
    return <div className="quiz-loading"><CircularProgress /> <Typography>Preparing Quiz...</Typography></div>;
  }

  return (
    <div className="quiz-container">
      <div className="quiz-content-wrapper">
        <div className="quiz-content">
          <div className="quiz-main-content">
          <Paper elevation={3} sx={{ 
            p: 4, 
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
          }}>
            {/* Progress and Timer */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 4,
                p: 2,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}>
                <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Typography>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{
                      scale: timeLeft < 60 ? [1, 1.05, 1] : 1,
                      opacity: 1,
                      color: timeLeft < 60 ? ['#2c3e50', '#e74c3c', '#2c3e50'] : '#2c3e50'
                    }}
                    transition={{
                      duration: timeLeft < 60 ? 0.5 : 0.3,
                      repeat: timeLeft < 60 ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                    className={`timer ${timeLeft < 60 ? 'warning' : ''}`}
                  >
                    <AccessTime sx={{ mr: 1 }} />
                    {formatTime(timeLeft)}
                  </motion.div>
              </Box>
            </motion.div>
            
            {/* Question */}
              <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
                  initial={{ x: 300, opacity: 0, scale: 0.8 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{ x: -300, opacity: 0, scale: 0.8 }}
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 25,
                    mass: 1,
                    duration: 0.5
                  }}
                  className="question-container"
                >
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="question-text"
                  >
                    {currentQuestion?.text}
                  </motion.div>

                  {/* Options */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {currentQuestion?.options?.map((option, index) => (
                      <Grid item xs={12} key={index}>
                        <motion.div
                          initial={{ y: 80, opacity: 0, scale: 0.9 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{
                            delay: 0.3 + index * 0.1,
                            type: "spring",
                            stiffness: 120,
                            damping: 18
                          }}
                  >
                    <Button
                      fullWidth
                      variant={selectedOption === index ? "contained" : "outlined"}
                      color={selectedOption === index ? "primary" : "inherit"}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedOption !== null}
                      sx={{
                        p: 2,
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        borderRadius: '12px',
                        border: '2px solid',
                        borderColor: selectedOption === index ? 'primary.main' : '#e0e0e0',
                        background: selectedOption === index ? 'primary.main' : 'white',
                        color: selectedOption === index ? 'white' : '#2c3e50',
                        fontSize: '1.1rem',
                        fontWeight: 500,
                              transform: selectedOption === null ? 'scale(1)' : 'scale(1.02)',
                        '&:hover': {
                          background: selectedOption === null ? 'rgba(52, 152, 219, 0.1)' : 'primary.main',
                          borderColor: selectedOption === null ? 'primary.main' : 'primary.main',
                                transform: selectedOption === null ? 'translateY(-2px) scale(1.02)' : 'scale(1.02)'
                        },
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {option}
                    </Button>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

                  {/* Quick Feedback */}
                  <AnimatePresence>
            {showFeedback && (
              <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          padding: '1rem 2rem',
                  borderRadius: '12px',
                          background: feedbackType === 'correct' ? '#2ecc71' : '#e74c3c',
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          zIndex: 1000,
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        {feedbackType === 'correct' ? '✓ Correct!' : '✗ Incorrect!'}
              </motion.div>
            )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
          </Paper>
          </div>

          {/* Leaderboard */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className="leaderboard-container"
          >
            <div className="leaderboard-header">
              <EmojiEvents sx={{ color: '#f1c40f', fontSize: 28 }} />
              <Typography variant="h6">Leaderboard</Typography>
            </div>
            <List className="leaderboard-list">
              <AnimatePresence initial={false}> {/* Disable initial animations to prevent flickering */}
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.userId} // Use userId as key for consistent re-ordering
                    initial={{ opacity: 0, y: 50 }} // Increased initial y for heavier effect
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }} // Increased exit y for heavier effect
                    transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }} // Adjusted duration and delay
                    layout // Enable layout animations for smooth re-ordering
                  >
                    <div className={`leaderboard-entry ${user && entry.userId === user._id ? 'current-user' : ''}`}>
                      <div className={`leaderboard-rank ${index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : ''}`}>
                        {index + 1}
                      </div>
                      <div className="leaderboard-user">
                        <div className="leaderboard-user-name">
                          {user && entry.userId === user._id ? 'You' : entry.name || `Player ${index + 1}`}
                        </div>
                        <div className="leaderboard-user-score">
                          Score: {entry.score}
                        </div>
                      </div>
                      <div className="leaderboard-time">
                        {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              </List>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Quiz; 