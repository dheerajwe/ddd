import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  Chat,
  People,
  MoreVert
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import DashboardHeader from '../../components/DashboardHeader';

const OnlineMeet = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        setIsLoading(false);
      }
    };

    initializeMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
      } else {
        if (streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, color: theme.palette.text.primary }}>
          Online Meeting
        </Typography>

        <Grid container spacing={3}>
          {/* Main Video Area */}
          <Grid item xs={12} md={9}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 2,
                height: '70vh',
                position: 'relative',
                overflow: 'hidden',
                background: '#000'
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Paper>
          </Grid>

          {/* Controls and Participants */}
          <Grid item xs={12} md={3}>
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Participants
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People sx={{ mr: 1 }} />
                  <Typography>You</Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Controls
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <IconButton
                    onClick={toggleCamera}
                    sx={{
                      bgcolor: isCameraOn ? theme.palette.primary.main : theme.palette.error.main,
                      color: 'white',
                      '&:hover': {
                        bgcolor: isCameraOn ? theme.palette.primary.dark : theme.palette.error.dark
                      }
                    }}
                  >
                    {isCameraOn ? <Videocam /> : <VideocamOff />}
                  </IconButton>
                  <IconButton
                    onClick={toggleMic}
                    sx={{
                      bgcolor: isMicOn ? theme.palette.primary.main : theme.palette.error.main,
                      color: 'white',
                      '&:hover': {
                        bgcolor: isMicOn ? theme.palette.primary.dark : theme.palette.error.dark
                      }
                    }}
                  >
                    {isMicOn ? <Mic /> : <MicOff />}
                  </IconButton>
                  <IconButton
                    onClick={toggleScreenShare}
                    sx={{
                      bgcolor: isScreenSharing ? theme.palette.success.main : theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        bgcolor: isScreenSharing ? theme.palette.success.dark : theme.palette.primary.dark
                      }
                    }}
                  >
                    {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
                  </IconButton>
                  <IconButton
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark
                      }
                    }}
                  >
                    <Chat />
                  </IconButton>
                  <IconButton
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark
                      }
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default OnlineMeet; 