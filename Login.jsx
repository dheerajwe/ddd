import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  School as SchoolIcon,
  Google as GoogleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [error, setError] = React.useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await login();
      // The navigation will happen automatically after checkAuth updates the user state
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login with Google');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1c2e 0%, #2d1b69 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0
        }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              background: `rgba(255, 255, 255, ${Math.random() * 0.1})`,
              borderRadius: '50%',
              filter: 'blur(20px)'
            }}
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />
        ))}
      </Box>

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
            >
              <SchoolIcon
                sx={{
                  fontSize: 60,
                  color: '#fff',
                  mb: 2,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }}
              />
            </motion.div>

            <Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 3,
                color: '#fff',
                fontWeight: 700,
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              Welcome Back
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                maxWidth: '400px'
              }}
            >
              Sign in with your Google account to access your dashboard and join live sessions
            </Typography>

            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <GoogleIcon />}
              sx={{
                width: '100%',
                py: 1.5,
                background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                transition: 'all 0.3s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #a5b4fc 0%, #6366f1 100%)',
                  transform: 'scale(1.02)',
                  boxShadow: '0 6px 16px rgba(99,102,241,0.4)'
                },
                '&:disabled': {
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)'
                }
              }}
            >
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          </Paper>
        </motion.div>
      </Container>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError('')}
          severity="error"
          sx={{
            width: '100%',
            background: 'rgba(220, 38, 38, 0.9)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            '& .MuiAlert-icon': {
              color: '#fff'
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login; 