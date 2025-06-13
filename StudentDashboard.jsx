import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const dragAreaRef = useRef(null);
  const navigate = useNavigate();

  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartY(e.type === 'mousedown' ? e.clientY : e.touches[0].clientY);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    setCurrentY(currentY);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const dragDistance = currentY - startY;
    if (dragDistance > 100) {
      setIsRevealed(true);
      navigate('/student/dashboard');
    } else {
      setCurrentY(0);
    }
  };

  const handleClick = () => {
    setIsRevealed(true);
    navigate('/student/dashboard');
  };

  useEffect(() => {
    const dragArea = dragAreaRef.current;
    if (!dragArea) return;

    // Mouse events
    dragArea.addEventListener('mousedown', handleDragStart);
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    // Touch events
    dragArea.addEventListener('touchstart', handleDragStart);
    window.addEventListener('touchmove', handleDragMove);
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      // Mouse events cleanup
      dragArea.removeEventListener('mousedown', handleDragStart);
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);

      // Touch events cleanup
      dragArea.removeEventListener('touchstart', handleDragStart);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, startY, currentY]);

  return (
    <div className="student-dashboard">
      <Header />
      <div 
        ref={dragAreaRef}
        className={`drag-area ${isDragging ? 'dragging' : ''}`}
        onClick={handleClick}
        style={{
          transform: `translateY(${currentY - startY}px)`,
          cursor: 'pointer'
        }}
      >
        <div className="drag-content">
          <div className="drag-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <p>Click or Drag to reveal dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 