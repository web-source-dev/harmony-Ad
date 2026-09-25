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
import publicSyncService from '../../services/publicSyncService';
import { getEmailValidationError, verifyEmail } from '../../utils/email';

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
    
    const emailError = getEmailValidationError(formData.email);
    if (emailError) {
      newFieldErrors.email = emailError;
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

      const emailServerError = await verifyEmail(formData.email);
      if (emailServerError) {
        setFieldErrors((prev) => ({ ...prev, email: emailServerError }));
        return;
      }

      // Create visitor data
      const visitorData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        visitedAt: new Date().toISOString(),
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Try to sync visitor info to server (online/offline aware)
      console.log('Syncing visitor info to server:', visitorData);
      const syncResult = await publicSyncService.syncVisitorInfo(visitorData);
      console.log('Sync result:', syncResult);
      
      if (syncResult.success) {
        console.log('Visitor info synced successfully:', syncResult.visitor);
        visitorData.serverId = syncResult.visitor.id;
        visitorData.sessionId = syncResult.visitor.sessionId;
      } else {
        console.log('Visitor info stored locally:', syncResult.message);
      }
      
      // Save visitor info to localStorage as backup
      localStorage.setItem('harmony_visitor_info', JSON.stringify(visitorData));
      
      // Call the callback with visitor info
      onVisitorInfo(visitorData);
      
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
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
              placeholder="Name"
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
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={async () => {
                const emailError = await verifyEmail(formData.email, { required: false });
                if (emailError) setFieldErrors((prev) => ({ ...prev, email: emailError }));
              }}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              placeholder="Email"
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
