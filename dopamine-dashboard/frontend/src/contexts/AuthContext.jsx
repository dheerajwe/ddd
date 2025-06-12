// AuthContext.jsx
// Provides authentication context and logic for the application.

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
    console.log('Checking auth status...', { 
      authChecked: authChecked.current, 
      hasUser: !!user,
      timestamp: new Date().toISOString(),
      path: window.location.pathname
    });
    
    // If we've already checked auth and have a user, don't check again
    if (authChecked.current && user) {
      console.log('Using cached auth state:', {
        userId: user._id,
        email: user.email,
        timestamp: new Date().toISOString()
      });
      return user;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Making auth check request...', {
        timestamp: new Date().toISOString(),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const { data } = await axios.get('/api/auth/me');
      console.log('Auth check response:', {
        user: data,
        timestamp: new Date().toISOString(),
        sessionState: {
          hasUser: !!data,
          userId: data?._id,
          email: data?.email
        }
      });
      setUser(data);
      authChecked.current = true;
      return data;
    } catch (error) {
      console.error('Auth check failed:', {
        error: error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      });
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
    console.log('Initiating login...', {
      timestamp: new Date().toISOString(),
      currentPath: window.location.pathname
    });
    setError(null);
    // Store the current URL to redirect back after login
    const returnUrl = window.location.pathname;
    console.log('Storing return URL:', {
      url: returnUrl,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('returnUrl', returnUrl);
    // Reset auth checked flag
    authChecked.current = false;
    // Redirect to Google OAuth
    console.log('Redirecting to Google OAuth...', {
      timestamp: new Date().toISOString()
    });
    window.location.href = 'http://localhost:5000/api/auth/google';
  }, []);

  const logout = useCallback(async () => {
    console.log('Initiating logout...', {
      timestamp: new Date().toISOString(),
      currentPath: window.location.pathname
    });
    try {
      setError(null);
      await axios.get('/api/auth/logout');
      console.log('Logout successful', {
        timestamp: new Date().toISOString()
      });
      setUser(null);
      authChecked.current = false;
      // Use window.location.replace to prevent adding to history
      window.location.replace('/login');
    } catch (error) {
      console.error('Logout failed:', {
        error: error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      });
      setError('Logout failed. Please try again.');
      setUser(null);
      authChecked.current = false;
    }
  }, []);

  // Check auth status only once on mount and after login redirect
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      console.log('Running initial auth check...', { 
        initialCheckDone: initialCheckDone.current,
        currentPath: window.location.pathname,
        timestamp: new Date().toISOString()
      });
      
      // Only do the initial check once
      if (initialCheckDone.current) {
        console.log('Initial check already done, skipping...', {
          timestamp: new Date().toISOString()
        });
        return;
      }
      initialCheckDone.current = true;

      const userData = await checkAuth();
      console.log('Initial auth check result:', { 
        hasUserData: !!userData,
        returnUrl: localStorage.getItem('returnUrl'),
        timestamp: new Date().toISOString(),
        sessionState: {
          hasUser: !!userData,
          userId: userData?._id,
          email: userData?.email
        }
      });

      if (userData) {
        // If we're on the login page and have a user, redirect to student dashboard
        if (window.location.pathname === '/login') {
          console.log('User authenticated, redirecting to student dashboard', {
            timestamp: new Date().toISOString(),
            userId: userData._id
          });
          window.location.replace('/student');
          return;
        }

        const returnUrl = localStorage.getItem('returnUrl');
        if (returnUrl && returnUrl !== window.location.pathname) {
          console.log('Redirecting to return URL:', {
            url: returnUrl,
            timestamp: new Date().toISOString(),
            userId: userData._id
          });
          localStorage.removeItem('returnUrl');
          window.location.replace(returnUrl);
        } else {
          console.log('No redirect needed', {
            timestamp: new Date().toISOString(),
            userId: userData._id
          });
        }
      } else {
        // If we're not on the login page and have no user, redirect to login
        if (window.location.pathname !== '/login') {
          console.log('No user data, redirecting to login', {
            timestamp: new Date().toISOString()
          });
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
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 