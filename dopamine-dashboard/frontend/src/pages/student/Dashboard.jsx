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
  const [userStats, setUserStats] = useState(null);
  const [meets, setMeets] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeMeet, setActiveMeet] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cards = [
    {
      id: 1,
      title: "Total Meets",
      description: "Number of meets you've participated in",
      icon: Users,
      stats: "12 Meets",
      colorClass: "blue",
    },
    {
      id: 2,
      title: "Average Score",
      description: "Your overall performance across all meets",
      icon: BarChart2,
      stats: "85%",
      colorClass: "green",
    },
    {
      id: 3,
      title: "Time Spent",
      description: "Total time spent in learning sessions",
      icon: Clock,
      stats: "24 Hours",
      colorClass: "purple",
    },
    {
      id: 4,
      title: "Achievements",
      description: "Badges and rewards earned",
      icon: Trophy,
      stats: "8 Badges",
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
      const response = await fetch('/api/stats/user');
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
      const response = await fetch('/api/meets');
      if (response.ok) {
        const data = await response.json();
        setMeets(data);
      } else {
        console.error('Failed to fetch meets');
        setMeets([
          {
            _id: '684ad77dd03755e6be1950ed',
            title: 'React Fundamentals',
            description: 'A beginner-friendly quiz on React basics.',
            duration: 30,
            participants: 120,
            questions: [
              { id: 1, text: 'What is React?', options: ['A JavaScript library', 'A framework', 'A language', 'A database'], correctAnswer: 0 },
              { id: 2, text: 'What is JSX?', options: ['JavaScript XML', 'A CSS preprocessor', 'A build tool', 'A database'], correctAnswer: 0 },
              { id: 3, text: 'What is a component?', options: ['A reusable piece of UI', 'A database entry', 'A network request', 'A server'], correctAnswer: 0 },
            ],
          },
          {
            _id: '684ad77dd03755e6be1950ee',
            title: 'Advanced JavaScript',
            description: 'Test your knowledge on advanced JS concepts.',
            duration: 45,
            participants: 80,
            questions: [
              { id: 4, text: 'What is a closure?', options: ['A function that remembers its outer variables', 'A type of loop', 'A variable scope', 'A data structure'], correctAnswer: 0 },
              { id: 5, text: 'What is a promise?', options: ['An object representing eventual completion or failure of an asynchronous operation', 'A type of callback', 'A synchronous function', 'A data type'], correctAnswer: 0 },
            ],
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching meets:', error);
      setMeets([
        {
          _id: '684ad77dd03755e6be1950ed',
          title: 'React Fundamentals',
          description: 'A beginner-friendly quiz on React basics.',
          duration: 30,
          participants: 120,
          questions: [
            { id: 1, text: 'What is React?', options: ['A JavaScript library', 'A framework', 'A language', 'A database'], correctAnswer: 0 },
            { id: 2, text: 'What is JSX?', options: ['JavaScript XML', 'A CSS preprocessor', 'A build tool', 'A database'], correctAnswer: 0 },
            { id: 3, text: 'What is a component?', options: ['A reusable piece of UI', 'A database entry', 'A network request', 'A server'], correctAnswer: 0 },
          ],
        },
        {
          _id: '684ad77dd03755e6be1950ee',
          title: 'Advanced JavaScript',
          description: 'Test your knowledge on advanced JS concepts.',
          duration: 45,
          participants: 80,
          questions: [
            { id: 4, text: 'What is a closure?', options: ['A function that remembers its outer variables', 'A type of loop', 'A variable scope', 'A data structure'], correctAnswer: 0 },
            { id: 5, text: 'What is a promise?', options: ['An object representing eventual completion or failure of an asynchronous operation', 'A type of callback', 'A synchronous function', 'A data type'], correctAnswer: 0 },
          ],
        },
      ]);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch('/api/stats/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      } else {
        console.error('Failed to fetch leaderboard');
        setLeaderboard([
          { _id: 'user1', name: 'Alice', totalScore: 1500, totalMeets: 18, avatar: '/avatar1.png' },
          { _id: 'user2', name: 'Bob', totalScore: 1450, totalMeets: 17, avatar: '/avatar2.png' },
          { _id: 'user3', name: 'Charlie', totalScore: 1300, totalMeets: 16, avatar: '/avatar3.png' },
          { _id: 'user4', name: 'Diana', totalScore: 1200, totalMeets: 14, avatar: '/avatar4.png' },
          { _id: 'user5', name: 'Eve', totalScore: 1100, totalMeets: 13, avatar: '/avatar5.png' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([
        { _id: 'user1', name: 'Alice', totalScore: 1500, totalMeets: 18, avatar: '/avatar1.png' },
        { _id: 'user2', name: 'Bob', totalScore: 1450, totalMeets: 17, avatar: '/avatar2.png' },
        { _id: 'user3', name: 'Charlie', totalScore: 1300, totalMeets: 16, avatar: '/avatar3.png' },
        { _id: 'user4', name: 'Diana', totalScore: 1200, totalMeets: 14, avatar: '/avatar4.png' },
        { _id: 'user5', name: 'Eve', totalScore: 1100, totalMeets: 13, avatar: '/avatar5.png' },
      ]);
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
      fetchUserStats();
      fetchMeets();
      fetchLeaderboard();
    }
  }, [user, fetchUserStats, fetchMeets, fetchLeaderboard]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/meets/stats', {
          withCredentials: true
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Use dummy data if API fails
        setStats({
          totalScore: 850,
          totalMeets: 12,
          accuracy: 78.5,
          currentStreak: 5,
          totalQuestions: 120,
          correctAnswers: 94,
          weeklyProgress: [
            { day: 'Mon', score: 75 },
            { day: 'Tue', score: 82 },
            { day: 'Wed', score: 68 },
            { day: 'Thu', score: 90 },
            { day: 'Fri', score: 85 },
            { day: 'Sat', score: 0 },
            { day: 'Sun', score: 0 }
          ],
          categoryBreakdown: [
            { category: 'Math', correct: 35, total: 45 },
            { category: 'Science', correct: 28, total: 35 },
            { category: 'English', correct: 31, total: 40 }
          ],
          recentActivity: [
            { date: '2024-03-15', score: 85, questions: 10 },
            { date: '2024-03-14', score: 78, questions: 8 },
            { date: '2024-03-13', score: 92, questions: 12 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

        {/* Quick Stats (Placeholder for now, original content below will be removed) */}
        {/* Removing original stats-grid to implement new card structure */}
        {/* The existing charts-container and recent-activity below will remain for now */}

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
                <span>Completed Math Quiz</span>
                <span className="time">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="meets-section">
          <h2 className="section-title">Available Meets <span className="title-icon"><Bookmark size={24} /></span></h2>
          <div className="meets-list">
            {meets.length > 0 ? (
              meets.map((meet) => (
                <div key={meet._id} className="meet-card">
                  <h3>{meet.title}</h3>
                  <p>{meet.description}</p>
                  <div className="meet-info">
                    <span><Clock size={16} /> {meet.duration} mins</span>
                    <span><Users size={16} /> {meet.participants} participants</span>
                  </div>
                  <button className="join-meet-button" onClick={() => handleJoinMeet(meet)}>
                    <Play size={20} /> Join Meet
                  </button>
                </div>
              ))
            ) : (
              <p>No meets available at the moment.</p>
            )}
          </div>
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