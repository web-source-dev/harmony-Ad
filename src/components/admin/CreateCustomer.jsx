import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  PersonAdd,
  Save,
  Clear,
} from '@mui/icons-material';
import API from '../../BackendAPi/ApiProvider';

const CreateCustomer = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear success/error messages
    if (success || error) {
      setSuccess('');
      setError('');
    }
  };

  const validateForm = () => {
    const newFieldErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    };
    
    let hasErrors = false;
    
    if (!formData.firstName.trim()) {
      newFieldErrors.firstName = 'First name is required';
      hasErrors = true;
    }
    
    if (!formData.lastName.trim()) {
      newFieldErrors.lastName = 'Last name is required';
      hasErrors = true;
    }
    
    if (!formData.email.trim()) {
      newFieldErrors.email = 'Email is required';
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newFieldErrors.email = 'Email is invalid';
      hasErrors = true;
    }
    
    if (!formData.phone.trim()) {
      newFieldErrors.phone = 'Phone number is required';
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
      setSuccess('');
      
      const customerData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        source: 'admin',
        isSubscribed: true,
        emailSubscriberStatus: 'subscribed',
        smsSubscriberStatus: 'subscribed',
        labels: ['admin'],
        subscribedAt: new Date(),
      };
      
      const response = await API.post('/api/admin/customers', customerData);
      setSuccess(`Contact "${response.data.firstName} ${response.data.lastName}" created successfully!`);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      });
      setFieldErrors({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      });
      
    } catch (err) {
      console.error('Error creating contact:', err);
      setError(err.message || 'Failed to create contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
    setFieldErrors({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
    setError('');
    setSuccess('');
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Create New Contact
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Card sx={{ borderRadius: '10px',border: '1px solid #000' }}>
            <CardHeader
              title="Form Submission"
              subheader="Fill in the form details below"
              sx={{
                borderBottom: '1px solid #000',
              }}
            />
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      error={!!fieldErrors.firstName}
                      helperText={fieldErrors.firstName}
                      disabled={isLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      error={!!fieldErrors.lastName}
                      helperText={fieldErrors.lastName}
                      disabled={isLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      error={!!fieldErrors.email}
                      helperText={fieldErrors.email}
                      disabled={isLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Phone Number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      error={!!fieldErrors.phone}
                      helperText={fieldErrors.phone}
                      disabled={isLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Error Message */}
                {error && (
                  <Alert severity="error" sx={{ mt: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* Success Message */}
                {success && (
                  <Alert severity="success" sx={{ mt: 3 }}>
                    {success}
                  </Alert>
                )}

                {/* Action Buttons */}
                <Box 
                  display="flex" 
                  gap={2} 
                  mt={4}
                  sx={{
                    flexDirection: { xs: 'column', sm: 'row' },
                    '& > *': { 
                      width: { xs: '100%', sm: 'auto' }
                    }
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                    disabled={isLoading}
                    size="large"
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
                    {isLoading ? 'Creating...' : 'Create Contact'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={handleClear}
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
                    disabled={isLoading}
                    size="large"
                  >
                    Clear Form
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateCustomer;