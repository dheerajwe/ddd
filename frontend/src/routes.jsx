// routes.jsx
// Defines all application routes using React Router.

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/student/Dashboard';
import Live from './pages/student/Live';
import QuizComplete from './pages/student/QuizComplete';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMeet from './pages/admin/Meet';
import { CircularProgress, Box } from '@mui/material';
import { useTheme } from '@mui/material';
import { memo } from 'react';

// Protected Route component
const ProtectedRoute = memo(({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor={theme.palette.background.default}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return <Layout>{children}</Layout>;
});

ProtectedRoute.displayName = 'ProtectedRoute';

const AppRoutes = memo(() => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
          ) : (
            <Login />
          )
        } 
      />
      <Route 
        path="/student" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/live/:meetId" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Live />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/quiz-complete" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <QuizComplete />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/meet/:meetId" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminMeet />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
});

AppRoutes.displayName = 'AppRoutes';

export default AppRoutes; 