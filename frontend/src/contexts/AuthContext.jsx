

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authChecked = useRef(false);
  const initialCheckDone = useRef(false);

  const checkAuth = useCallback(async () => {
    // Check for token in URL first
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Store token in localStorage
      localStorage.setItem('token', token);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // If we've already checked auth and have a user, don't check again
    if (authChecked.current && user) {
      return user;
    }

    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/api/auth/me');
      setUser(data);
      authChecked.current = true;
      return data;
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError('Authentication failed. Please try again.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const login = useCallback(() => {
    setError(null);
    // Store the current URL to redirect back after login
    const returnUrl = window.location.pathname;
    localStorage.setItem('returnUrl', returnUrl);
    // Reset auth checked flag
    authChecked.current = false;
    // Redirect to Google OAuth
    window.location.href = 'http://localhost:5000/api/auth/google';
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);
      await axios.get('/api/auth/logout');
      setUser(null);
      authChecked.current = false;
      localStorage.removeItem('token');
      window.location.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Logout failed. Please try again.');
      setUser(null);
      authChecked.current = false;
    }
  }, []);

  // Check auth status on mount and when token changes
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (initialCheckDone.current) {
        return;
      }
      initialCheckDone.current = true;

      const userData = await checkAuth();

      if (userData) {
        // If we're on the login page and have a user, redirect to student dashboard
        if (window.location.pathname === '/login') {
          window.location.replace('/student');
          return;
        }

        const returnUrl = localStorage.getItem('returnUrl');
        if (returnUrl && returnUrl !== window.location.pathname) {
          localStorage.removeItem('returnUrl');
          window.location.replace(returnUrl);
        }
      } else {
        // If we're not on the login page and have no user, redirect to login
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }
    };
    checkAuthAndRedirect();
  }, []); // Empty dependency array to run only once on mount

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 