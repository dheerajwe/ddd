import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Analytics as AnalyticsIcon,
  Quiz as QuizIcon,
  People as PeopleIcon,
  Score as ScoreIcon,
  MoreVert as MoreVertIcon,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const Meet = () => {
  const { meetId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const queryClient = useQueryClient();
  const [openAddQuestionDialog, setOpenAddQuestionDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
  });
  const [anchorEl, setAnchorEl] = useState(null);

  // Dummy Data for demonstration
  const dummyMeetDetails = {
    _id: meetId || 'dummy-meet-id',
    title: 'Dummy Product Launch Q&A',
    description: 'This is a dummy meet to manage questions and view analytics.',
    questions: [
      {
        _id: 'q1',
        questionText: 'What is the capital of France?',
        options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
        correctAnswer: 'Paris',
      },
      {
        _id: 'q2',
        questionText: 'Which planet is known as the Red Planet?',
        options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
        correctAnswer: 'Mars',
      },
    ],
  };

  const dummyAnalytics = {
    totalParticipants: 50,
    averageScore: 75,
    questionStats: {
      q1: { correctAttempts: 40, totalAttempts: 50, avgTime: 15 },
      q2: { correctAttempts: 30, totalAttempts: 50, avgTime: 20 },
    },
  };

  // Fetch meet data (using dummy data for now)
  const { data: meetData, isLoading: meetLoading, isError: meetError } = useQuery({
    queryKey: ['meet', meetId],
    queryFn: async () => {
      // const response = await axios.get(`/api/meets/${meetId}`);
      // return response.data;
      return dummyMeetDetails; // Using dummy data for UI development
    },
    enabled: !!meetId,
  });

  // Fetch analytics data (using dummy data for now)
  const { data: analyticsData, isLoading: analyticsLoading, isError: analyticsError } = useQuery({
    queryKey: ['meetAnalytics', meetId],
    queryFn: async () => {
      // const response = await axios.get(`/api/meets/${meetId}/analytics`);
      // return response.data;
      return dummyAnalytics; // Using dummy data for UI development
    },
    enabled: !!meetId,
  });

  // Add question mutation
  const addQuestionMutation = useMutation({
    mutationFn: async (questionData) => {
      const response = await axios.post(`/api/meets/${meetId}/questions`, questionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meet', meetId]);
      queryClient.invalidateQueries(['meetAnalytics', meetId]);
      setOpenAddQuestionDialog(false);
      setNewQuestion({ questionText: '', options: ['', '', '', ''], correctAnswer: '' });
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId) => {
      await axios.delete(`/api/meets/${meetId}/questions/${questionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meet', meetId]);
      queryClient.invalidateQueries(['meetAnalytics', meetId]);
    },
  });

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleAddQuestionSubmit = (e) => {
    e.preventDefault();
    addQuestionMutation.mutate(newQuestion);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  if (meetLoading || analyticsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" ml={2}>Loading meet details and analytics...</Typography>
      </Box>
    );
  }

  if (meetError || !meetData) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>Error loading meet or meet not found.</Typography>
        <Typography variant="body1">Please check the meet ID or try again later.</Typography>
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/admin')}>Go to Admin Dashboard</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Meet: {meetData.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={user?.avatar} 
              alt={user?.name}
              sx={{ width: 40, height: 40 }}
            />
            <Typography variant="body1">
              {user?.name}
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleMenuClick}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
            <MenuItem onClick={() => navigate('/admin')}>Go to Dashboard</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Analytics Panel */}
        <Box sx={{ flex: 1, minWidth: { md: 300 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', bgcolor: theme.palette.background.paper, boxShadow: theme.shadows[5] }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AnalyticsIcon sx={{ fontSize: 30, color: 'primary.main', mr: 1.5 }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Meet Analytics
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ borderRadius: '10px' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PeopleIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" color="text.secondary">Total Participants</Typography>
                    </Box>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                      {analyticsData?.totalParticipants || 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ borderRadius: '10px' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ScoreIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" color="text.secondary">Average Score</Typography>
                    </Box>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                      {analyticsData?.averageScore ? `${analyticsData.averageScore}%` : 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Question Stats (Detailed Analytics) */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', bgcolor: theme.palette.background.paper, boxShadow: theme.shadows[5] }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <QuizIcon sx={{ fontSize: 30, color: 'primary.main', mr: 1.5 }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Question Statistics
              </Typography>
            </Box>
            <List>
              {meetData?.questions?.length > 0 ? (
                meetData.questions.map((q, index) => {
                  const stats = analyticsData?.questionStats?.[q._id];
                  const accuracy = stats ? ((stats.correctAttempts / stats.totalAttempts) * 100).toFixed(1) : 'N/A';
                  const avgTime = stats ? `${stats.avgTime}s` : 'N/A';
                  return (
                    <ListItem key={q._id} sx={{ mb: 1, p: 1.5, borderRadius: '8px', bgcolor: theme.palette.grey[100] }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Question {index + 1}: {q.questionText}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="textSecondary">Accuracy: {accuracy}%</Typography>
                            <Typography variant="body2" color="textSecondary">Avg. Time: {avgTime}</Typography>
                          </>
                        }
                      />
                    </ListItem>
                  );
                })
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">No questions to display statistics for.</Typography>
              )}
            </List>
          </Paper>
        </Box>

        {/* Question Management Panel */}
        <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', bgcolor: theme.palette.background.paper, boxShadow: theme.shadows[5] }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Manage Questions
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddQuestionDialog(true)}
                color="primary"
              >
                Add New Question
              </Button>
            </Box>
            <List>
              <AnimatePresence>
                {meetData?.questions?.length > 0 ? (
                  meetData.questions.map((q) => (
                    <motion.div
                      key={q._id}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                    >
                      <ListItem
                        secondaryAction={
                          <IconButton edge="end" aria-label="delete" onClick={() => deleteQuestionMutation.mutate(q._id)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        }
                        sx={{ mb: 1, p: 1.5, borderRadius: '8px', bgcolor: theme.palette.grey[100] }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {q.questionText}
                            </Typography>
                          }
                          secondary={`Correct: ${q.correctAnswer} | Options: ${q.options.join(', ')}`}
                        />
                      </ListItem>
                    </motion.div>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary" align="center">No questions added yet.</Typography>
                )}
              </AnimatePresence>
            </List>
          </Paper>
        </Box>
      </Container>

      {/* Add Question Dialog */}
      <Dialog open={openAddQuestionDialog} onClose={() => setOpenAddQuestionDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Add New Question</DialogTitle>
        <form onSubmit={handleAddQuestionSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Question Text"
              type="text"
              fullWidth
              variant="outlined"
              value={newQuestion.questionText}
              onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            {newQuestion.options.map((option, index) => (
              <TextField
                key={index}
                margin="dense"
                label={`Option ${index + 1}`}
                type="text"
                fullWidth
                variant="outlined"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
                sx={{ mb: 1 }}
              />
            ))}
            <TextField
              margin="dense"
              label="Correct Answer"
              type="text"
              fullWidth
              variant="outlined"
              value={newQuestion.correctAnswer}
              onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
              required
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddQuestionDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={addQuestionMutation.isLoading}>
              {addQuestionMutation.isLoading ? <CircularProgress size={24} /> : 'Add Question'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Meet; 