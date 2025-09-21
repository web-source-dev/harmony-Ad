import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  useTheme,
} from '@mui/material';
import {
  CloudOff,
  Refresh,
  WifiOff,
  PersonAdd,
} from '@mui/icons-material';

const OfflineMessage = ({ onRetry, showCreateContact = false }) => {
  const theme = useTheme();

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
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This page requires an internet connection to function properly. 
              Please check your network connection and try again.
            </Typography>
          </Box>

          <Alert 
            severity="info" 
            sx={{ mb: 3, textAlign: 'left' }}
            icon={<WifiOff />}
          >
            <Typography variant="body2">
              <strong>Available offline:</strong> You can still create and manage customer contacts 
              using the "Create Contact" option in the sidebar.
            </Typography>
          </Alert>

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
            
            {showCreateContact && (
              <Button
                variant="outlined"
                startIcon={<PersonAdd />}
                onClick={() => window.location.href = '/contacts/create'}
                sx={{
                  borderRadius: '10px',
                  px: 3,
                  py: 1.2,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderColor: "#000",
                  color: "#000",
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#000',
                    color: '#fff',
                  }
                }}
              >
                Create Contact
              </Button>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            This page will automatically refresh when your connection is restored.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OfflineMessage;
