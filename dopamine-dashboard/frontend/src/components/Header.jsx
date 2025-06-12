"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Trophy, Zap, ChevronDown, ChevronUp } from 'lucide-react';

// Header.jsx
// Main header/navigation bar for the application.

const Header = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    background: isScrolled 
      ? 'rgba(0, 0, 0, 0.7)'
      : 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: isScrolled 
      ? '0 4px 20px rgba(0, 0, 0, 0.5)'
      : 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
  };

  const logoStyle = {
    fontSize: '1.8rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
  };

  const statsContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
  };

  const statCardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.4rem 0.8rem',
    borderRadius: '10px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    animation: 'pulseStatCard 2.5s infinite ease-in-out',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
  };

  const statIconStyle = {
    padding: '0.4rem',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const statTextStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
  };

  const statValueStyle = {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'white',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
  };

  const statLabelStyle = {
    fontSize: '0.7rem',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
  };

  const userProfileStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
  };

  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #6366F1',
    boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    background: 'rgba(30, 30, 30, 0.9)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    padding: '1rem',
    minWidth: '200px',
    opacity: isDropdownOpen ? 1 : 0,
    transform: isDropdownOpen ? 'translateY(0)' : 'translateY(-10px)',
    pointerEvents: isDropdownOpen ? 'auto' : 'none',
    transition: 'all 0.3s ease',
  };

  const dropdownItemStyle = {
    padding: '0.8rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    color: 'rgba(255, 255, 255, 0.8)',
  };

  return (
    <header style={headerStyle}>
      {/* Left: Logo and Title */}
      <div 
        style={{
          ...logoStyle,
          animation: 'pulseLogo 3.5s infinite ease-in-out',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Zap size={28} />
        <span style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>Dopamine Drive</span>
      </div>

      {/* Middle: Welcome Text and Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>
        <div 
          style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.8)',
            opacity: 0,
            animation: 'headerWelcomeTextAnimation 1s ease forwards 0.5s, welcomeStudentPulse 3s infinite ease-in-out',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.querySelector('span').style.background = 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)';
            e.currentTarget.querySelector('span').style.WebkitBackgroundClip = 'text';
            e.currentTarget.querySelector('span').style.WebkitTextFillColor = 'transparent';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.querySelector('span').style.background = 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)';
            e.currentTarget.querySelector('span').style.WebkitBackgroundClip = 'text';
            e.currentTarget.querySelector('span').style.WebkitTextFillColor = 'transparent';
          }}
        >
          Welcome<span style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>Student</span>
        </div>

        <div style={statsContainerStyle}>
          <div 
            style={statCardStyle}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.3)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)';
              e.currentTarget.style.border = '1px solid rgba(99, 102, 241, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.border = 'none';
            }}
          >
            <div style={statIconStyle}>
              <Trophy size={18} />
            </div>
            <div style={statTextStyle}>
              <span style={statValueStyle}>#3</span>
              <span style={statLabelStyle}>Current Rank</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: User Profile with Dropdown */}
      <div 
        style={userProfileStyle}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.border = '1px solid rgba(99, 102, 241, 0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.border = 'none';
        }}
      >
        <img 
          src={user?.avatar || '/placeholder.svg'} 
          alt={user?.name || 'User'} 
          style={avatarStyle}
        />
        <div>
          <div style={{ fontWeight: '600', color: 'white' }}>
            {user?.name || 'Guest User'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            {user?.email || 'guest@example.com'}
          </div>
        </div>
        {isDropdownOpen ? <ChevronUp size={20} color="rgba(255, 255, 255, 0.7)" /> : <ChevronDown size={20} color="rgba(255, 255, 255, 0.7)" />}

        {/* Dropdown Menu */}
        <div style={dropdownStyle}>
          <div 
            style={dropdownItemStyle}
            onClick={logout}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = '#EF4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;