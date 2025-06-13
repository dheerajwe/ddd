// axios.js
// Configures and exports an Axios instance for API requests.

import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Add cache control headers to prevent unnecessary requests
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    
    // Get token from URL if present (for initial login)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    // Get token from localStorage if not in URL
    const storedToken = token || localStorage.getItem('token');
    
    if (storedToken) {
      config.headers['Authorization'] = `Bearer ${storedToken}`;
      // Store token in localStorage if it came from URL
      if (token) {
        localStorage.setItem('token', token);
        // Remove token from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error:', error);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Handle 401 errors
    if (error.response?.status === 401) {
      console.error('Unauthorized:', error);
      // Clear token
      localStorage.removeItem('token');
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle CORS errors
    if (error.response?.status === 0) {
      console.error('CORS error:', error);
      return Promise.reject(new Error('CORS error. Please check your connection.'));
    }

    // Handle other errors
    console.error('API error:', error);
    return Promise.reject(error.response?.data?.message || 'An error occurred. Please try again.');
  }
);

export default instance; 