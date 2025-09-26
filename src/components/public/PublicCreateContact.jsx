import React, { useState, useEffect } from 'react';
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Container,
} from '@mui/material';
import {
  PersonAdd,
  Save,
  Clear,
  Search,
  CloudOff,
  CloudDone,
  Sync,
  Storage,
} from '@mui/icons-material';
import API from '../../BackendAPi/ApiProvider';
import publicOfflineStorage from '../../services/publicOfflineStorage';
import publicSyncService from '../../services/publicSyncService';
import VisitorPopup from './VisitorPopup';

const PublicCreateContact = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
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
  
  // Offline functionality state
  const [offlineCustomers, setOfflineCustomers] = useState([]);
  const [syncStatus, setSyncStatus] = useState({
    offlineCustomers: 0,
    pendingSync: 0,
    isSyncing: false
  });
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showVisitorPopup, setShowVisitorPopup] = useState(false);
  const [visitorInfo, setVisitorInfo] = useState(null);

  // Initialize offline storage and sync service
  useEffect(() => {
    const initializeOffline = async () => {
      try {
        console.log('Initializing public offline storage...');
        await publicOfflineStorage.init();
        
        // Check if visitor info exists in localStorage
        const storedVisitorInfo = localStorage.getItem('harmony_visitor_info');
        if (storedVisitorInfo) {
          setVisitorInfo(JSON.parse(storedVisitorInfo));
        } else {
          setShowVisitorPopup(true);
        }
        
        await updateSyncStatus();
        await loadOfflineCustomers();
        console.log('Public offline storage initialized successfully');
      } catch (error) {
        console.error('Failed to initialize offline storage:', error);
        console.log('Continuing in offline mode despite initialization error');
      }
    };

    // Initialize immediately, regardless of network status
    const initializeWithTimeout = async () => {
      try {
        await initializeOffline();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeWithTimeout();

    // Set up sync service listeners
    const handleSyncEvent = (event, data) => {
      switch (event) {
        case 'syncStarted':
          setSyncStatus(prev => ({ ...prev, isSyncing: true }));
          break;
        case 'syncCompleted':
          setSyncStatus(prev => ({ ...prev, isSyncing: false }));
          updateSyncStatus();
          loadOfflineCustomers();
          break;
        case 'contactSynced':
          setSuccess(`Contact "${data.contact.firstName} ${data.contact.lastName}" synced successfully!`);
          // Refresh offline customers list since customer was removed
          loadOfflineCustomers();
          break;
        default:
          break;
      }
    };

    publicSyncService.addSyncListener(handleSyncEvent);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      publicSyncService.removeSyncListener(handleSyncEvent);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && syncStatus.offlineCustomers > 0) {
      handleAutoSync();
    }
  }, [isOnline, syncStatus.offlineCustomers]);

  const updateSyncStatus = async () => {
    try {
      const status = await publicSyncService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  };

  const loadOfflineCustomers = async () => {
    try {
      const customers = await publicOfflineStorage.getOfflineContacts();
      setOfflineCustomers(customers);
    } catch (error) {
      console.error('Failed to load offline customers:', error);
    }
  };

  const handleAutoSync = async () => {
    try {
      await publicSyncService.startSync();
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  };

  const handleVisitorInfo = (visitorData) => {
    setVisitorInfo(visitorData);
    setShowVisitorPopup(false);
    console.log('Visitor info saved:', visitorData);
  };

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
        source: 'public',
        isSubscribed: true,
        emailSubscriberStatus: 'subscribed',
        smsSubscriberStatus: 'subscribed',
        labels: ['public'],
        subscribedAt: new Date(),
      };
      
      if (isOnline) {
        // Online mode - try to create customer on server
        try {
          const response = await API.post('/api/admin/customers', customerData);
          setSuccess(`Contact "${response.data.firstName} ${response.data.lastName}" created successfully!`);
        } catch (err) {
          // If server request fails, store offline
          console.log('Server request failed, storing offline:', err);
          await handleOfflineCreate(customerData);
        }
      } else {
        // Offline mode - store locally
        await handleOfflineCreate(customerData);
      }
      
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
      
      // Update status
      await updateSyncStatus();
      await loadOfflineCustomers();
      
    } catch (err) {
      console.error('Error creating contact:', err);
      setError(err.message || 'Failed to create contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfflineCreate = async (customerData) => {
    try {
      const offlineCustomer = await publicOfflineStorage.storeContact(customerData);
      setSuccess(`Contact "${offlineCustomer.firstName} ${offlineCustomer.lastName}" stored offline and will be synced when online!`);
      console.log('Contact stored offline:', offlineCustomer);
    } catch (error) {
      throw new Error('Failed to store contact offline');
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

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Initializing contact form...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Setting up local storage and sync services
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Contact Us
        </Typography>
        
        {/* Network Status and Offline Info */}
        <Box display="flex" alignItems="center" gap={2}>
          {visitorInfo && (
            <Chip
              icon={<PersonAdd />}
              label={`Welcome, ${visitorInfo.name}`}
              color="success"
              variant="outlined"
            />
          )}
          
          {!isOnline && (
            <Chip
              icon={<CloudOff />}
              label="Offline Mode"
              color="warning"
              variant="outlined"
            />
          )}
          
          {syncStatus.offlineCustomers > 0 && (
            <Chip
              icon={<Storage />}
              label={`${syncStatus.offlineCustomers} stored offline`}
              color="info"
              variant="outlined"
              onClick={() => setShowOfflineDialog(true)}
              clickable
            />
          )}
          
          {syncStatus.isSyncing && (
            <Chip
              icon={<Sync />}
              label="Syncing..."
              color="primary"
              variant="filled"
            />
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Card sx={{ borderRadius: '10px',border: '1px solid #000' }}>
            <CardHeader
              title="Get In Touch"
              subheader="Fill in your details below and we'll get back to you"
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
                    {isLoading ? 'Submitting...' : 'Submit Contact'}
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

      {/* Offline Customers Dialog */}
      <Dialog 
        open={showOfflineDialog} 
        onClose={() => setShowOfflineDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Offline Contacts ({offlineCustomers.length})
            </Typography>
            {isOnline && syncStatus.offlineCustomers > 0 && (
              <Button
                variant="contained"
                startIcon={<Sync />}
                onClick={handleAutoSync}
                disabled={syncStatus.isSyncing}
                size="small"
              >
                {syncStatus.isSyncing ? 'Syncing...' : 'Sync All'}
              </Button>
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {syncStatus.isSyncing && (
            <Box mb={2}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" mt={1}>
                Syncing contacts to server...
              </Typography>
            </Box>
          )}
          
          {offlineCustomers.length === 0 ? (
            <Typography color="text.secondary">
              No offline contacts to sync.
            </Typography>
          ) : (
            <List>
              {offlineCustomers.map((customer, index) => (
                <React.Fragment key={customer.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${customer.firstName} ${customer.lastName}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {customer.email} • {customer.phone}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Stored: {new Date(customer.createdAt).toLocaleString()}
                            {customer.synced && (
                              <Chip 
                                label="Synced" 
                                size="small" 
                                color="success" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < offlineCustomers.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowOfflineDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Visitor Info Popup */}
      <VisitorPopup
        open={showVisitorPopup}
        onClose={() => {}} // Don't allow closing without providing info
        onVisitorInfo={handleVisitorInfo}
      />
    </Container>
  );
};

export default PublicCreateContact;
