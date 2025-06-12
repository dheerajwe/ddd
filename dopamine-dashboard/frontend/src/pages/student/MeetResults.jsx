// MeetResults.jsx
// Displays detailed results for a completed quiz/meet, including answer breakdown and summary.

import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MeetResults.css';

const MeetResults = () => {
  const { meetId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(location.state?.results || null);
  const [meetTitle, setMeetTitle] = useState(location.state?.meetTitle || 'Meet Results');
  const [loading, setLoading] = useState(!location.state?.results);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!results) {
      const fetchResults = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/meets/${meetId}/results`);
          setResults(response.data.results);
          setMeetTitle(response.data.meetTitle || 'Meet Results');
          setLoading(false);
        } catch (err) {
          setError('Failed to load results');
          setLoading(false);
        }
      };
      fetchResults();
    }
  }, [meetId, results]);

  if (loading) {
    return <div className="results-container"><div className="loading">Loading results...</div></div>;
  }

  if (error) {
    return <div className="results-container"><div className="error">{error}</div></div>;
  }

  if (!results) {
    return <div className="results-container"><div className="error">No results found.</div></div>;
  }

  const { score, totalQuestions, answers, timeTaken } = results;
  const correctAnswersCount = answers.filter(answer => answer.isCorrect).length;
  const accuracy = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="results-container">
      <h1 className="results-title">{meetTitle} - Quiz Results</h1>
      <div className="results-summary">
        <div className="summary-item">
          <span className="label">Score:</span>
          <span className="value">{score} / {totalQuestions * 10}</span> {/* Assuming 10 points per question */}
        </div>
        <div className="summary-item">
          <span className="label">Correct Answers:</span>
          <span className="value">{correctAnswersCount} / {totalQuestions}</span>
        </div>
        <div className="summary-item">
          <span className="label">Accuracy:</span>
          <span className="value">{accuracy.toFixed(2)}%</span>
        </div>
        <div className="summary-item">
          <span className="label">Time Taken:</span>
          <span className="value">{formatTime(timeTaken)}</span>
        </div>
      </div>

      <h2 className="answers-title">Your Answers</h2>
      <div className="answers-list">
        {answers.map((answer, index) => (
          <div key={index} className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
            <p className="question-text"><strong>Q{index + 1}:</strong> {answer.questionText}</p>
            <p className="your-answer">Your Answer: {answer.selectedOptionText}</p>
            {!answer.isCorrect && (
              <p className="correct-answer">Correct Answer: {answer.correctOptionText}</p>
            )}
            <span className="answer-status">
              {answer.isCorrect ? 'Correct' : 'Incorrect'}
            </span>
          </div>
        ))}
      </div>

      <button className="back-to-dashboard-button" onClick={() => navigate('/student/dashboard')}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default MeetResults; 
