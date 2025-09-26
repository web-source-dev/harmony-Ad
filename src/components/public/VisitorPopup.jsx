import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

const VisitorPopup = ({ open, onClose, onVisitorInfo }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear error message
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const newFieldErrors = {
      name: '',
      email: '',
    };
    
    let hasErrors = false;
    
    if (!formData.name.trim()) {
      newFieldErrors.name = 'Name is required';
      hasErrors = true;
    }
    
    if (!formData.email.trim()) {
      newFieldErrors.email = 'Email is required';
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newFieldErrors.email = 'Email is invalid';
      hasErrors = true;
    }
    
    setFieldErrors(newFieldErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Save visitor info to localStorage
      const visitorInfo = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        visitedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('harmony_visitor_info', JSON.stringify(visitorInfo));
      
      // Call the callback with visitor info
      onVisitorInfo(visitorInfo);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
      });
      setFieldErrors({
        name: '',
        email: '',
      });
      
    } catch (err) {
      console.error('Error saving visitor info:', err);
      setError('Failed to save visitor information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Don't allow closing without providing information
    // User must provide name and email
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      disableBackdropClick
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <PersonIcon color="primary" />
          <Typography variant="h6">
            Welcome to Harmony 4 All
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              label="Your Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
              disabled={isLoading}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              disabled={isLoading}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                }
              }}
            />
          </Box>
          
          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </form>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
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
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisitorPopup;
