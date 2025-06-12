// QuizComplete.jsx
// Displays quiz results, leaderboard, and answer review after quiz completion.

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  useTheme,
  CircularProgress,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  DoneAll as DoneAllIcon,
  AccessTime as AccessTimeIcon,
  MilitaryTech as MilitaryTechIcon
} from '@mui/icons-material';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

const MotionPaper = motion(Paper);
const MotionChip = motion(Chip);

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

const QuizComplete = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const { meetId, score, totalQuestions, answers, timeTaken, leaderboard: initialLeaderboard } = location.state || {};
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard || []);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(!initialLeaderboard);
  const [errorLeaderboard, setErrorLeaderboard] = useState(null);

  useEffect(() => {
    if (!meetId) {
      navigate('/student/dashboard');
      return;
    }

    const fetchLeaderboard = async () => {
      if (initialLeaderboard) return; // Skip if we already have the data
      
      setLoadingLeaderboard(true);
      try {
        const res = await axios.get(`/api/answers/leaderboard/${meetId}`);
        const sortedLeaderboard = res.data.sort((a, b) => b.totalPoints - a.totalPoints);
        setLeaderboard(sortedLeaderboard);
        setLoadingLeaderboard(false);
      } catch (err) {
        setErrorLeaderboard('Failed to load leaderboard.');
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [meetId, navigate, initialLeaderboard]);

  const correctAnswersCount = answers ? answers.filter(a => a.isCorrect).length : 0;
  const accuracy = totalQuestions ? (correctAnswersCount / totalQuestions) * 100 : 0;

  if (loadingLeaderboard) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" ml={2}>Loading results...</Typography>
      </Box>
    );
  }

  if (errorLeaderboard) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Typography color="error">{errorLeaderboard}</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/student/dashboard')}>Go to Dashboard</Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', bgcolor: 'background.paper' }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700 }}>
              Quiz Completed!
            </Typography>
            
            <Stack spacing={3} sx={{ mb: 4 }}>
              <MotionChip
                icon={<TrophyIcon />}
                label={`Score: ${score}/${totalQuestions * 10}`}
                color="primary"
                variant="outlined"
                sx={{ py: 2, px: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
              <MotionChip
                icon={<CheckCircleIcon />}
                label={`Accuracy: ${accuracy.toFixed(1)}%`}
                color="secondary"
                variant="outlined"
                sx={{ py: 2, px: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
              <MotionChip
                icon={<AccessTimeIcon />}
                label={`Time Taken: ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`}
                color="info"
                variant="outlined"
                sx={{ py: 2, px: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            </Stack>

            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Your Answers
            </Typography>
            
            <Grid container spacing={2}>
              {answers && answers.map((answer, index) => (
                <Grid item xs={12} key={index}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      bgcolor: answer.isCorrect ? 'success.light' : 'error.light',
                      color: answer.isCorrect ? 'success.contrastText' : 'error.contrastText'
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Q{index + 1}: {answer.questionText}
                    </Typography>
                    <Typography variant="body2">
                      Your Answer: {answer.selectedOptionText}
                    </Typography>
                    {!answer.isCorrect && (
                      <Typography variant="body2">
                        Correct Answer: {answer.correctOptionText}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Leaderboard
            </Typography>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Player</TableCell>
                    <TableCell align="right">Score</TableCell>
                    <TableCell align="right">Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <TableRow 
                      key={entry._id}
                      sx={{ 
                        bgcolor: entry._id === user?.id ? 'primary.light' : 'inherit',
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar>{entry.name?.[0] || 'U'}</Avatar>
                          <Typography>{entry.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{entry.totalPoints}</TableCell>
                      <TableCell align="right">{entry.averageTime?.toFixed(1)}s</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/student/dashboard')}
                sx={{ px: 4, py: 1.5 }}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default QuizComplete; 