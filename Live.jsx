// Live.jsx
// Handles live quiz sessions for students, including real-time question display and leaderboard updates.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  LinearProgress,
  useTheme,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Card,
  CardContent,
  Button,
  CircularProgress,
  useMediaQuery,
  List,
  ListItem
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from '../../utils/axios';
import LiveQuestion from '../../components/LiveQuestion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

const Live = () => {
  const { meetId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [questions, setQuestions] = useState([]);
  const [meet, setMeet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);

  const fetchLeaderboard = async (meetMongoId) => {
    try {
      const res = await axios.get(`/api/answers/leaderboard/${meetMongoId}`);
      setLeaderboardData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setLeaderboardData([]);
    }
  };

  useEffect(() => {
    const fetchMeet = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/meets/${meetId}`);
        setMeet(res.data);
        setQuestions(res.data.questions || []);
        setLoading(false);
        // Fetch leaderboard using the MongoDB _id
        if (res.data && res.data._id) {
          fetchLeaderboard(res.data._id);
        }
      } catch (err) {
        setError('Failed to load quiz.');
        setLoading(false);
      }
    };
    fetchMeet();
  }, [meetId]);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (!loading && questions.length > 0 && !currentQuestion) {
      // If no more questions, navigate to completion
      navigate('/student/quiz-complete', {
        state: {
          meetId: meet?._id,
          totalQuestions: questions.length,
          score: 0, // TODO: fetch from backend
          rank: 0   // TODO: fetch from backend
        }
      });
    }
  }, [currentQuestion, loading, questions.length, navigate, meet]);

  const handleAnswerSubmit = (questionId, answer, timeTaken) => {
    setIsAnswered(true);
    setShowFeedback(true);
    setFeedbackType(answer === currentQuestion.correctAnswer ? 'correct' : 'incorrect');
    
    // TODO: Send answer to backend via API call and expect Socket.IO updates
    // For now, no simulated score update here.
  };

  const handleTimeout = (questionId) => {
    setIsAnswered(true);
    setShowFeedback(true);
    setFeedbackType('timeout');
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setIsAnswered(false);
    setCurrentQuestionIndex(prev => prev + 1);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><Typography color="error">{error}</Typography></Box>;
  }
  if (!meet) {
    return null;
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      py: 4
    }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 4
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton 
                  onClick={() => navigate('/student')}
                  sx={{ 
                    bgcolor: 'background.paper',
                    boxShadow: theme.shadows[4],
                    '&:hover': { bgcolor: 'background.paper' }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {meet.title}
                </Typography>
                <Chip 
                  label="LIVE" 
                  color="error" 
                  sx={{ 
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 1 }
                    }
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<TrophyIcon />}
                  label={`Rank #0`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<SpeedIcon />}
                  label={`0% Accuracy`}
                  color="secondary"
                  variant="outlined"
                />
                <Chip
                  icon={<TimelineIcon />}
                  label={`0 Points`}
                  color="info"
                  variant="outlined"
                />
              </Box>
            </Box>
          </motion.div>

          <Grid container spacing={4}>
            {/* Main Content - Question Section */}
            <Grid item xs={12} md={8}>
              <motion.div variants={itemVariants}>
                <Paper sx={{ 
                  p: 4, 
                  borderRadius: '16px',
                  boxShadow: theme.shadows[8],
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Progress Bar */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(currentQuestionIndex + 1) / questions.length * 100}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'background.default',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                        }
                      }}
                    />
                  </Box>

                  {/* Question Component */}
                  <AnimatePresence mode="wait">
                    {currentQuestion && (
                      <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <LiveQuestion
                          key={currentQuestionIndex}
                          question={currentQuestion}
                          onAnswerSubmit={handleAnswerSubmit}
                          onTimeout={handleTimeout}
                          isAnswered={isAnswered}
                          onNextQuestion={handleNextQuestion}
                          timeLimit={currentQuestion?.timeLimit}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Feedback Animation */}
                  <AnimatePresence>
                    {showFeedback && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 10
                        }}
                      >
                        {feedbackType === 'correct' ? (
                          <CheckCircleIcon sx={{ fontSize: 100, color: 'success.main' }} />
                        ) : (
                          <ErrorIcon sx={{ fontSize: 100, color: 'error.main' }} />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Paper>
              </motion.div>

              {/* Performance Metrics */}
              <motion.div variants={itemVariants}>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ 
                      borderRadius: '12px',
                      boxShadow: theme.shadows[4],
                      bgcolor: 'background.paper'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <SpeedIcon color="primary" />
                          <Typography variant="h6">Response Time</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">
                          {0}s
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ 
                      borderRadius: '12px',
                      boxShadow: theme.shadows[4],
                      bgcolor: 'background.paper'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <AssessmentIcon color="success" />
                          <Typography variant="h6">Accuracy</Typography>
                        </Box>
                        <Typography variant="h4" color="success.main">
                          {0}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ 
                      borderRadius: '12px',
                      boxShadow: theme.shadows[4],
                      bgcolor: 'background.paper'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PsychologyIcon color="secondary" />
                          <Typography variant="h6">AI Questions</Typography>
                        </Box>
                        <Typography variant="h4" color="secondary.main">
                          {Math.floor(Math.random() * 5) + 1}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </motion.div>
            </Grid>

            {/* Leaderboard Section */}
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  boxShadow: theme.shadows[8],
                  bgcolor: 'background.paper',
                  height: '100%'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mb: 3
                  }}>
                    <TrophyIcon color="primary" />
                    Live Leaderboard
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {leaderboardData.length > 0 ? (
                      <List>
                        {leaderboardData.map((participant, index) => (
                          <ListItem key={participant._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, p: 1.5, borderRadius: '8px', bgcolor: 'background.default' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  width: 30,
                                  color: index === 0 ? 'primary.main' : 'text.primary',
                                  fontWeight: index === 0 ? 700 : 400
                                }}
                              >
                                #{index + 1}
                              </Typography>
                              <Avatar 
                                src={participant.avatar} 
                                sx={{ 
                                  width: 40, 
                                  height: 40,
                                  border: index === 0 ? '2px solid' : 'none',
                                  borderColor: 'primary.main'
                                }}
                              />
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography 
                                  variant="subtitle1"
                                  sx={{ 
                                    fontWeight: index === 0 ? 700 : 400,
                                    color: index === 0 ? 'primary.main' : 'text.primary'
                                  }}
                                >
                                  {participant.name}
                                </Typography>
                              </Box>
                            </Box>
                            <Typography 
                              variant="h6"
                              sx={{ 
                                color: index === 0 ? 'primary.main' : 'text.primary',
                                fontWeight: index === 0 ? 700 : 400
                              }}
                            >
                              {participant.score}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        No participants yet.
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Live; 