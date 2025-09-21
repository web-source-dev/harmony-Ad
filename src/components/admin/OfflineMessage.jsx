import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  LinearProgress,
} from '@mui/material';
import {
  CloudOff,
  Refresh,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const OfflineMessage = ({ onRetry, autoRedirect = false, redirectDelay = 3000 }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(redirectDelay / 1000);

  useEffect(() => {
    if (autoRedirect) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/contacts/create');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [autoRedirect, navigate, redirectDelay]);

  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="60vh"
      sx={{ p: 3 }}
    >
      <Card 
        sx={{ 
          maxWidth: 500, 
          width: '100%',
          textAlign: 'center',
          border: '1px solid #000',
          borderRadius: '10px',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <CloudOff 
              sx={{ 
                fontSize: 80, 
                color: theme.palette.warning.main,
                mb: 2 
              }} 
            />
             <Typography variant="h4" fontWeight="bold" gutterBottom>
               You're Offline
             </Typography>
             <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
               This page requires an internet connection to function properly.
             </Typography>
           </Box>

           {autoRedirect && (
             <Box sx={{ mb: 3 }}>
               <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                 Redirecting to Create Contact page in {countdown} seconds...
               </Typography>
               <LinearProgress 
                 variant="determinate" 
                 value={((redirectDelay / 1000 - countdown) / (redirectDelay / 1000)) * 100}
                 sx={{ 
                   height: 6, 
                   borderRadius: 3,
                   backgroundColor: theme.palette.grey[200],
                   '& .MuiLinearProgress-bar': {
                     backgroundColor: theme.palette.primary.main,
                     borderRadius: 3,
                   }
                 }}
               />
             </Box>
           )}
           <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
             {onRetry && (
               <Button
                 variant="contained"
                 startIcon={<Refresh />}
                 onClick={onRetry}
                 sx={{
                   borderRadius: '10px',
                   px: 3,
                   py: 1.2,
                   textTransform: 'none',
                   fontWeight: 500,
                   background: "#000",
                   color: "#fff",
                   transition: 'all 0.3s ease',
                   '&:hover': {
                     background: "#000",
                     color: "#fff",
                     transform: 'translateY(-2px)',
                   }
                 }}
               >
                 Retry Connection
               </Button>
             )}
           </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OfflineMessage;
