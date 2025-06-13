import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  AccountCircle,
  School as SchoolIcon,
  Event as EventIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../utils/axios';

// Create motion components
const MotionCard = motion(Card);
const MotionTableRow = motion(TableRow);

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [newMeet, setNewMeet] = useState({
    title: '',
    date: '',
    time: '',
    location: ''
  });

  const queryClient = useQueryClient();

  // Dummy Data for demonstration
  const dummyStats = {
    totalStudents: 1234,
    totalQuestions: 567,
    activeMeets: 5
  };

  const dummyMeets = [
    {
      _id: '654321098765432109876543',
      title: 'Product Launch Q&A',
      date: '2024-07-15T10:00:00Z',
      time: '10:00',
      location: 'Online',
      questions: [{}, {}] // Dummy questions
    },
    {
      _id: '654321098765432109876544',
      title: 'Team Brainstorm Session',
      date: '2024-07-20T14:30:00Z',
      time: '14:30',
      location: 'Conference Room A',
      questions: [{}, {}, {}]
    },
    {
      _id: '654321098765432109876545',
      title: 'Monthly Review Meeting',
      date: '2024-08-01T09:00:00Z',
      time: '09:00',
      location: 'Virtual',
      questions: [{}, {}, {}, {}]
    }
  ];

  // Fetch meets (using dummy data for now)
  const { data: meets = dummyMeets, isLoading } = useQuery({
    queryKey: ['meets'],
    queryFn: async () => {
      // In a real application, you would fetch from /api/meets
      // const response = await axios.get('/api/meets');
      // return response.data;
      return dummyMeets; // Using dummy data for demonstration
    }
  });

  // Create meet mutation (still connected to backend for future use)
  const createMeet = useMutation({
    mutationFn: async (meetData) => {
      const response = await axios.post('/api/meets', meetData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meets']);
      setNewMeet({ title: '', date: '', time: '', location: '' });
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    createMeet.mutate(newMeet);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
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
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ pt: 10, pb: 4 }}>
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={4}>
            <MotionCard
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5">Total Students</Typography>
                </Box>
                <Typography variant="h3">{dummyStats.totalStudents}</Typography>
              </CardContent>
            </MotionCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <MotionCard
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EventIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5">Total Questions</Typography>
                </Box>
                <Typography variant="h3">{dummyStats.totalQuestions}</Typography>
              </CardContent>
            </MotionCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <MotionCard
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5">Active Meets</Typography>
                </Box>
                <Typography variant="h3">{dummyStats.activeMeets}</Typography>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Create Meet Form */}
          <Grid item xs={12} md={6}>
            <MotionCard
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Create New Meet
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Title"
                        value={newMeet.title}
                        onChange={(e) => setNewMeet({ ...newMeet, title: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Date"
                        value={newMeet.date}
                        onChange={(e) => setNewMeet({ ...newMeet, date: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="time"
                        label="Time"
                        value={newMeet.time}
                        onChange={(e) => setNewMeet({ ...newMeet, time: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Location"
                        value={newMeet.location}
                        onChange={(e) => setNewMeet({ ...newMeet, location: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<AddIcon />}
                        fullWidth
                      >
                        Create Meet
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Meets Table */}
          <Grid item xs={12} md={6}>
            <MotionCard
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Meets
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Questions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {meets.map((meet, index) => (
                        <MotionTableRow
                          key={meet._id}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: index * 0.1 }}
                        >
                          <TableCell>{meet.title}</TableCell>
                          <TableCell>{new Date(meet.date).toLocaleDateString()}</TableCell>
                          <TableCell>{meet.time}</TableCell>
                          <TableCell>{meet.location}</TableCell>
                          <TableCell>{meet.questions?.length || 0}</TableCell>
                        </MotionTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 