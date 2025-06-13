import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { Award, Calendar, CheckCircle, Clock, Users, BarChart2, Play, Trophy, Target, Plus, TrendingUp, Bookmark } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircularProgress, Typography } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const BarChartComponent = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  return (
    <div className="chart-container bar-chart-container">
      {data.map((item, index) => (
        <div key={index} className="bar-item">
          <div className="bar" style={{ height: `${(item.value / maxValue) * 100}%` }}></div>
          <span className="bar-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const PieChartComponent = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let startAngle = 0;
  return (
    <div className="chart-container pie-chart-container">
      {data.map((item, index) => {
        const angle = (item.value / total) * 360;
        const style = {
          background: `conic-gradient(
            #6366F1 ${startAngle}deg,
            #8B5CF6 ${startAngle + angle}deg,
            transparent ${startAngle + angle}deg
          )`,
        };
        startAngle += angle;
        return <div key={index} className="pie-slice" style={style}></div>;
      })}
      <div className="pie-center">
        {total > 0 ? `${Math.round((data[0].value / total) * 100)}%` : 'N/A'}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    totalMeets: 0,
    averageScore: 0,
    timeSpent: 0,
    badgesEarned: 0
  });
  const [meets, setMeets] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeMeet, setActiveMeet] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [stats, setStats] = useState({
    totalScore: 850,
    totalMeets: 12,
    accuracy: 85.5,
    currentStreak: 5,
    totalQuestions: 120,
    correctAnswers: 102,
    weeklyProgress: [
      { day: 'Mon', score: 75 },
      { day: 'Tue', score: 85 },
      { day: 'Wed', score: 65 },
      { day: 'Thu', score: 90 },
      { day: 'Fri', score: 80 },
      { day: 'Sat', score: 95 },
      { day: 'Sun', score: 70 }
    ],
    categoryBreakdown: [
      { category: 'React', correct: 35, total: 40 },
      { category: 'JavaScript', correct: 25, total: 30 },
      { category: 'Node.js', correct: 18, total: 20 },
      { category: 'CSS', correct: 8, total: 10 }
    ],
    recentActivity: [
      { date: '2 hours ago', activity: 'Completed React Quiz' },
      { date: '1 day ago', activity: 'Completed JavaScript Quiz' },
      { date: '2 days ago', activity: 'Completed Node.js Quiz' }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to format time for display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`;
    }
    return `${minutes} min${minutes > 1 ? 's' : ''}`;
  };

  const cards = [
    {
      id: 1,
      title: "Total Meets",
      description: "Number of meets you've participated in",
      icon: Users,
      stats: `${stats.totalMeets || 0} Meets`,
      colorClass: "blue",
    },
    {
      id: 2,
      title: "Average Score",
      description: "Your overall performance across all meets",
      icon: BarChart2,
      stats: `${stats.accuracy?.toFixed(1) || 0}%`,
      colorClass: "green",
    },
    {
      id: 3,
      title: "Time Spent",
      description: "Total time spent in learning sessions",
      icon: Clock,
      stats: formatTime(stats.totalQuestions * 2 || 0),
      colorClass: "purple",
    },
    {
      id: 4,
      title: "Achievements",
      description: "Badges and rewards earned",
      icon: Trophy,
      stats: `${Math.floor(stats.totalScore / 100) || 0} Badges`,
      colorClass: "orange",
    },
  ];

  const performanceData = useMemo(() => [
    { label: 'Week 1', value: 75 },
    { label: 'Week 2', value: 80 },
    { label: 'Week 3', value: 70 },
    { label: 'Week 4', value: 90 },
  ], []);

  const questionCategoryData = useMemo(() => [
    { label: 'React', value: 40 },
    { label: 'JavaScript', value: 30 },
    { label: 'Node.js', value: 20 },
    { label: 'CSS', value: 10 },
  ], []);

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stats/user', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      } else {
        console.error('Failed to fetch user stats');
        setUserStats({
          totalScore: 1250,
          totalMeets: 15,
          accuracy: 85,
          currentStreak: 7,
          totalQuestions: 200,
          correctAnswers: 170,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setUserStats({
        totalScore: 1250,
        totalMeets: 15,
        accuracy: 85,
        currentStreak: 7,
        totalQuestions: 200,
        correctAnswers: 170,
      });
    }
  }, []);

  const fetchMeets = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/meets', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch meets: ${response.statusText}`);
      }
      
        const data = await response.json();
      console.log('Fetched meets:', data); // Debug log
          setMeets(data);
    } catch (error) {
      console.error('Error fetching meets:', error);
      setMeets([]);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/meets/leaderboard', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Leaderboard data:', data); // Debug log
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    }
  }, []);

  const handleJoinMeet = (meet) => {
    navigate(`/student/quiz/${meet._id}`);
  };

  const handleAnswer = (selectedOption) => {
    if (activeMeet.questions[currentQuestion].correctAnswer === selectedOption) {
      setScore(prev => prev + 10);
    }
    
    if (currentQuestion < activeMeet.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Quiz completed
      setShowQuiz(false);
      setActiveMeet(null);
      // Update user stats
      fetchUserStats();
      fetchLeaderboard();
    }
  };

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && showQuiz) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setShowQuiz(false);
      setActiveMeet(null);
    }
    return () => clearInterval(timer);
  }, [timeLeft, showQuiz]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchMeets();
      fetchLeaderboard();
    }
  }, [user]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/meets/stats', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Stats data:', data);
      
      // Update stats state with the fetched data
      setStats({
        totalScore: data.totalScore || 850,
        totalMeets: data.totalMeets || 12,
        accuracy: data.accuracy || 85.5,
        currentStreak: data.currentStreak || 5,
        totalQuestions: data.totalQuestions || 120,
        correctAnswers: data.correctAnswers || 102,
        weeklyProgress: data.weeklyProgress || [
          { day: 'Mon', score: 75 },
          { day: 'Tue', score: 85 },
          { day: 'Wed', score: 65 },
          { day: 'Thu', score: 90 },
          { day: 'Fri', score: 80 },
          { day: 'Sat', score: 95 },
          { day: 'Sun', score: 70 }
        ],
        categoryBreakdown: data.categoryBreakdown || [
          { category: 'React', correct: 35, total: 40 },
          { category: 'JavaScript', correct: 25, total: 30 },
          { category: 'Node.js', correct: 18, total: 20 },
          { category: 'CSS', correct: 8, total: 10 }
        ],
        recentActivity: data.recentActivity || [
          { date: '2 hours ago', activity: 'Completed React Quiz' },
          { date: '1 day ago', activity: 'Completed JavaScript Quiz' },
          { date: '2 days ago', activity: 'Completed Node.js Quiz' }
        ]
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.message);
      // Set default values if fetch fails
      setStats({
        totalScore: 850,
        totalMeets: 12,
        accuracy: 85.5,
        currentStreak: 5,
        totalQuestions: 120,
        correctAnswers: 102,
        weeklyProgress: [
          { day: 'Mon', score: 75 },
          { day: 'Tue', score: 85 },
          { day: 'Wed', score: 65 },
          { day: 'Thu', score: 90 },
          { day: 'Fri', score: 80 },
          { day: 'Sat', score: 95 },
          { day: 'Sun', score: 70 }
        ],
        categoryBreakdown: [
          { category: 'React', correct: 35, total: 40 },
          { category: 'JavaScript', correct: 25, total: 30 },
          { category: 'Node.js', correct: 18, total: 20 },
          { category: 'CSS', correct: 8, total: 10 }
        ],
        recentActivity: [
          { date: '2 hours ago', activity: 'Completed React Quiz' },
          { date: '1 day ago', activity: 'Completed JavaScript Quiz' },
          { date: '2 days ago', activity: 'Completed Node.js Quiz' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect for debugging
  useEffect(() => {
    console.log('Current meets state:', meets);
  }, [meets]);

  // Memoized data for stat cards
  const statCardsData = useMemo(() => {
    const currentUserStats = userStats || {};
    return [
      {
        id: 1,
        color: 'blue',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.25 10.25a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V11h-1.25a.75.75 0 010-1.5h2zm-1.5 8.25a.75.75 0 00-.75.75.75.75 0 00.75.75h3.5a.75.75 0 00.75-.75.75.75 0 00-.75-.75H16.5zm-5-3.5a.75.75 0 00-.75.75.75.75 0 00.75.75h3.5a.75.75 0 00.75-.75.75.75 0 00-.75-.75H11.75zm-3.5-5a.75.75 0 00-.75.75.75.75 0 00.75.75h3.5a.75.75 0 00.75-.75.75.75 0 00-.75-.75H8.25z" />
            <path fillRule="evenodd" d="M5.25 2.25A1.5 1.5 0 003.75 3.75v16.5c0 .828.672 1.5 1.5 1.5h13.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H15V3.75A1.5 1.5 0 0013.5 2.25h-8.25zM12 6a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75A.75.75 0 0112 6zm-2.25 6a.75.75 0 01.75-.75h3.5a.75.75 0 010 1.5h-3.5a.75.75 0 01-.75-.75zm0 4.5a.75.75 0 01.75-.75h3.5a.75.75 0 010 1.5h-3.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          </svg>
        ),
        title: 'Total Quizzes',
        description: 'Number of quizzes you\'ve participated in',
        value: `${meets.length} Quizzes`,
      },
      {
        id: 2,
        color: 'green',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0115.938-2.61a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75h-2.25a.75.75 0 00-.75.75v.243L13.29 7.78a.75.75 0 00-1.06 0L9.47 10.59a.75.75 0 01-1.06 0L6.22 8.72a.75.75 0 00-1.06 0L2.25 12V13.5zm7.5-6a.75.75 0 01-.75-.75V4.5a.75.75 0 011.5 0V6.75a.75.75 0 01-.75.75zm5.25 3a.75.75 0 01-.75-.75V4.5a.75.75 0 011.5 0V9.75a.75.75 0 01-.75.75zm3.75-3.5a.75.75 0 00-.75.75V9a.75.75 0 001.5 0V7.5a.75.75 0 00-.75-.75z" clipRule="evenodd" />
          </svg>
        ),
        title: 'Average Score',
        description: 'Your overall performance across all quizzes',
        value: `${currentUserStats.averageScore || 0}%`,
      },
      {
        id: 3,
        color: 'purple',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M12 2.25c-5.325 0-9.75 4.314-9.75 9.75s4.314 9.75 9.75 9.75 9.75-4.314 9.75-9.75S17.325 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h3.75a.75.75 0 00.75-.75V9z" clipRule="evenodd" />
          </svg>
        ),
        title: 'Time Spent',
        description: 'Total time spent in learning sessions',
        value: `${formatTime(currentUserStats.timeSpent || 0)}`,
      },
      {
        id: 4,
        color: 'orange',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M5.25 9.75a.75.75 0 01.75-.75h12a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zm0 3a.75.75 0 01.75-.75h12a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zm0 3a.75.75 0 01.75-.75h12a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          </svg>
        ),
        title: 'Achievements',
        description: 'Badges and rewards earned',
        value: `${currentUserStats.badgesEarned || 0} Badges`,
      },
    ];
  }, [userStats, meets, formatTime]);

  // Define a color cycle for the meet cards
  const colors = [
    { 
      bg: '#ffffff',
      text: '#1F2937',
      border: '#E5E7EB',
      accent: '#6366F1',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
    },
    { 
      bg: '#ffffff',
      text: '#1F2937',
      border: '#E5E7EB',
      accent: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
    },
    { 
      bg: '#ffffff',
      text: '#1F2937',
      border: '#E5E7EB',
      accent: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    },
    { 
      bg: '#ffffff',
      text: '#1F2937',
      border: '#E5E7EB',
      accent: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader />
      <div className="dashboard-wrapper">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Student Dashboard</h1>
          <p className="dashboard-subtitle"></p>
        </div>

        {/* Cards Grid */}
        <div className="cards-grid">
          {cards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div key={card.id} className={`card card-${card.colorClass}`}>
                {/* Background Pattern */}
                <div className="card-pattern">
                  {/* Note: The inner pattern circle is handled by CSS nth-child, not a separate element here */}
                </div>

                {/* Icon */}
                <div className={`card-icon icon-${card.colorClass}`}>
                  <IconComponent className="icon" />
                </div>

                {/* Content */}
                <div className="card-content">
                  <h3 className={`card-title title-${card.colorClass}`}>{card.title}</h3>
                  <p className="card-description">{card.description}</p>

                  {/* Stats */}
                  <div className="card-footer">
                    <span className={`card-stats stats-${card.colorClass}`}>{card.stats}</span>
                    {/* Arrow removed as per user request */}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className={`card-hover-effect hover-${card.colorClass}`}></div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="charts-container">
          <div className="chart-card">
            <h3>Weekly Progress</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={stats?.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h3>Category Breakdown</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats?.categoryBreakdown}
                    dataKey="correct"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {stats?.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {stats?.recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <CheckCircle size={20} className="success" />
                <span>{activity.activity}</span>
                <span className="time">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Available Meets */}
        <section className="meets-section">
          <h2 className="section-title">
            Available Quizzes
            <span className="title-icon"><Bookmark size={24} /></span>
          </h2>
          {loading ? (
            <div className="loading-message">Loading quizzes...</div>
          ) : meets.length > 0 ? (
            <div className="meets-grid">
              {meets.map((meet, index) => {
                console.log(meet)
                const cardColor = colors[index % colors.length];
                return (
                  <motion.div
                    key={meet._id}
                    className="meet-card"
                    style={{
                      background: `linear-gradient(135deg, ${cardColor.bg} 0%, ${cardColor.bg}dd 100%)`,
                      color: cardColor.text,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      borderRadius: '20px',
                      padding: '2rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: `1px solid ${cardColor.border}`,
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                      height: '100%',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)',
                      border: `1px solid ${cardColor.accent}`
                    }}
                  >
                    {/* Decorative Elements */}
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      right: '-50%',
                      width: '200%',
                      height: '200%',
                      background: `radial-gradient(circle at center, ${cardColor.accent}15 0%, transparent 70%)`,
                      opacity: 0.5,
                      transform: 'rotate(-45deg)',
                      pointerEvents: 'none'
                    }} />

                    {/* Card Header */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      gap: '1rem',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.5rem', 
                        fontWeight: '700',
                        color: cardColor.text,
                        flex: 1,
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {meet.title}
                      </h3>
                      <span style={{
                        background: `linear-gradient(135deg, ${cardColor.accent} 0%, ${cardColor.accent}dd 100%)`,
                        color: '#fff',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {meet.duration} mins
                      </span>
                    </div>

                    {/* Card Description */}
                    <p style={{ 
                      margin: 0,
                      color: cardColor.text,
                      opacity: 0.9,
                      fontSize: '1rem',
                      lineHeight: '1.6',
                      flex: 1,
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {meet.description}
                    </p>

                    {/* Card Footer */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto',
                      paddingTop: '1rem',
                      borderTop: `1px solid ${cardColor.border}40`,
                      position: 'relative',
                      zIndex: 1
                    }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinMeet(meet);
                        }}
                        style={{
                          background: `linear-gradient(135deg, ${cardColor.accent} 0%, ${cardColor.accent}dd 100%)`,
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '12px',
                          color: '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          width: '100%',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }}
                      >
                        Start Quiz
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="no-meets-message">
              <p>No quizzes available at the moment.</p>
              {error && <p className="error-message">{error}</p>}
              <button className="retry-button" onClick={fetchMeets}>
                Retry
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
  </div>
);

export default Dashboard; 