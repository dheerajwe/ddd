// QuizComplete.jsx
// Displays quiz results, leaderboard, and answer review after quiz completion.

import React, { useEffect, useState } from 'react';
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
import './QuizComplete.css';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const { results, meetTitle } = location.state || {};

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/meets/stats');
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load statistics');
        setLoading(false);
      }
    };

    if (results) {
      fetchStats();
    } else {
      setError('No quiz results found');
      setLoading(false);
    }
  }, [results]);

  if (loading) {
    return (
      <div className="quiz-complete-container">
        <CircularProgress />
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="quiz-complete-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error || 'No quiz results found'}</p>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/student/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const score = results.score;
  const totalQuestions = results.totalQuestions;
  const percentage = (score / (totalQuestions * 10)) * 100;
  const timeTaken = Math.floor(results.timeTaken / 60);

  return (
    <div className="quiz-complete-container">
      <motion.div
        className="quiz-complete-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Quiz Complete!</h1>
        <h2>{meetTitle}</h2>

        <div className="results-grid">
          <motion.div
            className="score-card"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3>Your Score</h3>
            <div className="score-circle">
              <span className="score-value">{score}</span>
              <span className="score-max">/ {totalQuestions * 10}</span>
            </div>
            <div className="score-percentage">{percentage.toFixed(1)}%</div>
          </motion.div>

          <motion.div
            className="stats-card"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3>Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Time Taken</span>
                <span className="stat-value">{timeTaken} minutes</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Questions</span>
                <span className="stat-value">{totalQuestions}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Correct Answers</span>
                <span className="stat-value">{Math.floor(score / 10)}</span>
              </div>
              {stats && (
                <>
                  <div className="stat-item">
                    <span className="stat-label">Total Meets</span>
                    <span className="stat-value">{stats.totalMeets}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Average Score</span>
                    <span className="stat-value">{stats.averageScore}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Current Streak</span>
                    <span className="stat-value">{stats.currentStreak} days</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>

        <div className="action-buttons">
              <Button
                variant="contained"
            color="primary"
                onClick={() => navigate('/student/dashboard')}
          >
            Return to Dashboard
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate(`/student/meet/${results.meetId}`)}
          >
            Review Quiz
              </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizComplete; 