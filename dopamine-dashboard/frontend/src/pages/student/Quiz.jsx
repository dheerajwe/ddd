// Quiz.jsx
// Handles the quiz-taking experience for students, including question navigation, answer submission, and leaderboard updates.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';  // Use the configured axios instance
import { useAuth } from '../../contexts/AuthContext';
import './Quiz.css';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meet, setMeet] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeet = async () => {
      try {
        setLoading(true);
        // First start the quiz attempt
        await axios.post(`/api/meets/${id}/start`);
        
        // Then fetch the meet data
        const response = await axios.get(`/api/meets/${id}`);
        
        if (!response.data) {
          setError('Meet data is empty.');
          setLoading(false);
          return;
        }

        if (!response.data.questions || response.data.questions.length === 0) {
          setError('No questions found for this meet.');
          setLoading(false);
          return;
        }
        
        setMeet(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching meet:', error);
        setError(`Failed to load quiz: ${error.response?.data?.message || error.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    if (user) {
      fetchMeet();
    }
  }, [id, user]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && meet) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showResult && meet) {
      handleNextQuestion();
    }
  }, [timeLeft, showResult, meet]);

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = async () => {
    if (!meet) return;

    const isCorrect = selectedOption === meet.questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 10);
    }

    if (currentQuestion < meet.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(30);
    } else {
      // Quiz completed
      try {
        const response = await axios.post(`/api/meets/${meet._id}/submit`, {
          score,
          timeTaken: 30 - timeLeft,
          answers: meet.questions.map((q, idx) => ({
            questionId: q._id,
            selectedOption: selectedOption
          }))
        });
        
        setShowResult(true);
        // Navigate to results page with the response data
        navigate('/student/quiz-complete', {
          state: {
            meetId: meet._id,
            score: response.data.score,
            totalQuestions: meet.questions.length,
            answers: response.data.answers,
            timeTaken: response.data.timeTaken,
            leaderboard: response.data.leaderboard
          }
        });
      } catch (error) {
        console.error('Error submitting quiz:', error);
        setError('Failed to submit quiz. Please try again.');
      }
    }
  };

  const updateLeaderboard = async () => {
    if (!meet) return;
    
    try {
      const response = await axios.get(`/api/answers/leaderboard/${meet._id}`);
      if (response.data) {
        setLeaderboard(response.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  useEffect(() => {
    if (meet) {
      updateLeaderboard();
      const interval = setInterval(updateLeaderboard, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [meet]);

  if (loading) {
    return <div className="quiz-loading">Loading quiz...</div>;
  }

  if (error) {
    return <div className="quiz-error">Error: {error}</div>;
  }

  if (!meet) {
    return <div className="quiz-error">Meet not found</div>;
  }

  if (showResult) {
    return (
      <div className="quiz-result">
        <h2>Quiz Completed!</h2>
        <p>Your Score: {score}</p>
        <button onClick={() => navigate('/student/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  if (!meet.questions || meet.questions.length === 0 || currentQuestion >= meet.questions.length) {
    return <div className="quiz-error">No questions available or invalid question index.</div>;
  }

  const currentQ = meet.questions[currentQuestion];

  if (!currentQ || !currentQ.options || currentQ.options.length === 0) {
    return <div className="quiz-loading">Loading question data...</div>;
  }

  return (
    <div className="quiz-container">
      <div className="quiz-main">
        <div className="quiz-header">
          <h2>{meet.title}</h2>
          <div className="quiz-info">
            <span>Question {currentQuestion + 1} of {meet.questions.length}</span>
            <span>Time Left: {timeLeft}s</span>
            <span>Score: {score}</span>
          </div>
        </div>

        <div className="question-container">
          <h3>{currentQ.text}</h3>
          <div className="options-grid">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${selectedOption === index ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(index)}
                disabled={selectedOption !== null}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {selectedOption !== null && (
          <button 
            className="next-button"
            onClick={handleNextQuestion}
          >
            {currentQuestion < meet.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        )}
      </div>

      <div className="leaderboard">
        <h3>Live Leaderboard</h3>
        <div className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <div key={index} className="leaderboard-entry">
              <span className="rank">{index + 1}</span>
              <span className="name">{entry.username}</span>
              <span className="score">{entry.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quiz; 