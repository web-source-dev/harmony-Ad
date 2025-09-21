import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
} from '@mui/material';
import {
  CloudOff,
  Refresh,
} from '@mui/icons-material';
import { useEffect } from 'react';


const OfflineMessage = ({ onRetry }) => {
  const theme = useTheme();

  useEffect(() => {
    window.location.href = '/contacts/create';


  }, []);

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
          </Box>
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
