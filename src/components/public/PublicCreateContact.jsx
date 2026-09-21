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
  Logout,
  Add,
  Close,
} from '@mui/icons-material';
import API from '../../BackendAPi/ApiProvider';
import publicOfflineStorage from '../../services/publicOfflineStorage';
import publicSyncService from '../../services/publicSyncService';
import { useNetwork } from '../../contexts/NetworkContext';
import VisitorPopup from './VisitorPopup';
import { formatUSPhoneForStorage, getUSPhoneValidationError } from '../../utils/usPhone';
import PhoneField from '../shared/PhoneField';

const PublicCreateContact = () => {
  const { isOnline: networkIsOnline, cacheVersion } = useNetwork();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    labels: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    labels: '',
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
  const [visitorStats, setVisitorStats] = useState({
    totalContactsCreated: 0,
    offlineContactsCreated: 0
  });
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [labelInput, setLabelInput] = useState('');

  // Predefined label suggestions
  const labelSuggestions = ['volunteer', 'donor','sponsor', 'student', 'parent', 'teacher', 'community', 'event', 'newsletter','public'];

  // Initialize offline storage and sync service
  useEffect(() => {
    const initializeOffline = async () => {
      try {
        console.log('Initializing public offline storage...');
        await publicOfflineStorage.init();
        
        // Set cache version for sync service
        if (cacheVersion) {
          publicSyncService.setCacheVersion(cacheVersion);
        }
        
        // Check if visitor info exists in localStorage
        const storedVisitorInfo = localStorage.getItem('harmony_visitor_info');
        if (storedVisitorInfo) {
          const visitorData = JSON.parse(storedVisitorInfo);
          setVisitorInfo(visitorData);
          
          // Load visitor stats
          if (visitorData.email) {
            await loadVisitorStats(visitorData.email);
          }
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
          // Refresh visitor stats if visitor email is available
          if (data.visitorEmail && visitorInfo?.email === data.visitorEmail) {
            loadVisitorStats(data.visitorEmail);
          }
          break;
        case 'syncError':
          console.error('Sync error:', data.error);
          setError('Failed to sync some contacts. They will be retried automatically.');
          break;
        default:
          break;
      }
    };

    publicSyncService.addSyncListener(handleSyncEvent);

    // Cleanup
    return () => {
      publicSyncService.removeSyncListener(handleSyncEvent);
    };
  }, [cacheVersion]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && syncStatus.offlineCustomers > 0) {
      console.log('Network came online, triggering auto-sync...');
      handleAutoSync();
    }
  }, [isOnline, syncStatus.offlineCustomers]);

  // Listen for online/offline events and trigger sync
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network: Online - checking for unsynced data');
      setIsOnline(true);
      
      // Use the improved sync service method
      setTimeout(async () => {
        try {
          await publicSyncService.checkAndSync();
        } catch (error) {
          console.error('Failed to check and sync on online:', error);
        }
      }, 1000); // Small delay to ensure network is stable
    };

    const handleOffline = () => {
      console.log('Network: Offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up periodic sync check (every 30 seconds when online)
    const syncInterval = setInterval(async () => {
      if (navigator.onLine) {
        try {
          await publicSyncService.checkAndSync();
        } catch (error) {
          console.error('Periodic sync check failed:', error);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, []);

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

  const loadVisitorStats = async (visitorEmail) => {
    if (!visitorEmail) return;
    
    try {
      console.log('Loading visitor stats for:', visitorEmail);
      const visitorData = await publicOfflineStorage.getVisitorInfo(visitorEmail);
      console.log('Retrieved visitor data:', visitorData);
      
      if (visitorData) {
        const totalContacts = (visitorData.contactsCreated?.length || 0) + 
                             (visitorData.offlineContactsCreated?.length || 0);
        const offlineContacts = visitorData.offlineContactsCreated?.length || 0;
        
        console.log('Calculated stats:', { totalContacts, offlineContacts });
        
        setVisitorStats({
          totalContactsCreated: totalContacts,
          offlineContactsCreated: offlineContacts
        });
      } else {
        console.log('No visitor data found for:', visitorEmail);
        setVisitorStats({
          totalContactsCreated: 0,
          offlineContactsCreated: 0
        });
      }
    } catch (error) {
      console.error('Failed to load visitor stats:', error);
      setVisitorStats({
        totalContactsCreated: 0,
        offlineContactsCreated: 0
      });
    }
  };

  const handleVisitorInfo = (visitorData) => {
    setVisitorInfo(visitorData);
    setShowVisitorPopup(false);
    console.log('Visitor info saved:', visitorData);
    
    // Load visitor stats
    if (visitorData.email) {
      loadVisitorStats(visitorData.email);
    }
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

    const phoneError = getUSPhoneValidationError(formData.phone, { required: true });
    if (phoneError) {
      newFieldErrors.phone = phoneError;
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
        phone: formatUSPhoneForStorage(formData.phone),
        source: 'public',
        isSubscribed: true,
        emailSubscriberStatus: 'subscribed',
        smsSubscriberStatus: 'subscribed',
        labels: ['public', ...formData.labels],
        subscribedAt: new Date(),
      };
      
      if (isOnline) {
        // Online mode - try to create customer on server
        try {
          // Add visitor tracking data to customer data
          const customerDataWithVisitor = {
            ...customerData,
            visitorEmail: visitorInfo?.email || null,
            visitorName: visitorInfo?.name || null
          };
          
          const response = await API.post('/api/admin/customers', customerDataWithVisitor);
          setSuccess(`Contact "${response.data.customer.firstName} ${response.data.customer.lastName}" created successfully!`);
          
          // Update visitor contact tracking if visitor info exists
          if (visitorInfo?.email) {
            try {
              await publicOfflineStorage.updateVisitorContactTracking(
                visitorInfo.email,
                customerData,
                false // isOffline = false for online creation
              );
              
              // Refresh visitor stats
              await loadVisitorStats(visitorInfo.email);
            } catch (visitorError) {
              console.error('Failed to update visitor contact tracking:', visitorError);
              // Don't fail the contact creation if visitor tracking fails
            }
          }
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
        labels: [],
      });
      setFieldErrors({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        labels: '',
      });
      setLabelInput('');
      
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
      // Add visitor tracking data to customer data
      const customerDataWithVisitor = {
        ...customerData,
        visitorEmail: visitorInfo?.email || null,
        visitorName: visitorInfo?.name || null
      };
      
      const offlineCustomer = await publicOfflineStorage.storeContact(customerDataWithVisitor);
      
      // Update visitor contact tracking if visitor info exists
      if (visitorInfo?.email) {
        try {
          await publicOfflineStorage.updateVisitorContactTracking(
            visitorInfo.email,
            customerData,
            true // isOffline
          );
          
          // Refresh visitor stats
          await loadVisitorStats(visitorInfo.email);
        } catch (visitorError) {
          console.error('Failed to update visitor contact tracking:', visitorError);
          // Don't fail the contact creation if visitor tracking fails
        }
      }
      
      setSuccess(`Contact "${offlineCustomer.firstName} ${offlineCustomer.lastName}" stored offline and will be synced when online!`);
      console.log('Contact stored offline:', offlineCustomer);
    } catch (error) {
      throw new Error('Failed to store contact offline');
    }
  };

  const handleAddLabel = () => {
    if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, labelInput.trim()]
      }));
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  const handleLabelInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLabel();
    }
  };

  const handleClear = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      labels: [],
    });
    setFieldErrors({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      labels: '',
    });
    setLabelInput('');
    setError('');
    setSuccess('');
  };

  const handleLogout = async () => {
    try {
      // Clear visitor info from localStorage
      localStorage.removeItem('harmony_visitor_info');
      
      // Clear visitor info from IndexedDB
      if (visitorInfo?.email) {
        try {
          // End current session on server if online
          if (navigator.onLine) {
            await API.put(`/api/visitor/session/${visitorInfo.email}`, {
              action: 'end'
            });
          }
        } catch (error) {
          console.error('Failed to end session on server:', error);
          // Don't fail logout if server request fails
        }
      }
      
      // Reset visitor state
      setVisitorInfo(null);
      setVisitorStats({
        totalContactsCreated: 0,
        offlineContactsCreated: 0
      });
      
      // Show visitor popup again for new visitor
      setShowVisitorPopup(true);
      
      setSuccess('Logged out successfully. Please provide your information to continue.');
      console.log('Visitor logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Failed to logout properly. Please refresh the page.');
    }
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
        Form Submission
        </Typography>
        
        {/* Network Status and Offline Info */}
        <Box display="flex" alignItems="center" gap={2}>
          {visitorInfo && (
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                icon={<PersonAdd />}
                label={`Welcome, ${visitorInfo.name}`}
                color="success"
                variant="outlined"
                title={`Total contacts created: ${visitorStats.totalContactsCreated}${visitorStats.offlineContactsCreated > 0 ? ` (${visitorStats.offlineContactsCreated} offline)` : ''}`}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<Logout />}
                onClick={() => setShowLogoutDialog(true)}
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  borderColor: 'error.main',
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.main',
                    color: 'white',
                  }
                }}
                title="Logout and start as new visitor"
              >
                Logout
              </Button>
            </Box>
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
          
          {isOnline && syncStatus.pendingSync > 0 && !syncStatus.isSyncing && (
            <Chip
              icon={<Sync />}
              label={`${syncStatus.pendingSync} pending sync`}
              color="warning"
              variant="outlined"
              onClick={handleAutoSync}
              clickable
            />
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Card sx={{ borderRadius: '10px',border: '1px solid #000' }}>
            <CardHeader
              subheader="Fill in details below"
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
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      error={!!fieldErrors.firstName}
                      helperText={fieldErrors.firstName}
                      placeholder="First Name"
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
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      error={!!fieldErrors.lastName}
                      helperText={fieldErrors.lastName}
                      placeholder="Last Name"
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
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      error={!!fieldErrors.email}
                      helperText={fieldErrors.email}
                      placeholder="Email"
                      disabled={isLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <PhoneField
                      fullWidth
                      required
                      value={formData.phone}
                      onChange={(value) => handleInputChange('phone', value)}
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

                  {/* Labels Section */}
                  <Grid item xs={12}>
                    <Box>
                      <Box display="flex" gap={1} alignItems="center" sx={{ mb: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={labelInput}
                          onChange={(e) => setLabelInput(e.target.value)}
                          onKeyPress={handleLabelInputKeyPress}
                          placeholder="Add a label..."
                          disabled={isLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Add />}
                          onClick={handleAddLabel}
                          disabled={!labelInput.trim() || formData.labels.includes(labelInput.trim()) || isLoading}
                          sx={{
                            backgroundColor: '#000',
                            color: '#fff',
                            minWidth: 'auto',
                            borderRadius: '8px',
                            px: 2,
                            py: 1,
                          }}
                        >
                          Add
                        </Button>
                      </Box>
                      
                      {/* Display current labels */}
                      {formData.labels.length > 0 && (
                        <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                          {formData.labels.map((label, index) => (
                            <Chip
                              key={index}
                              label={label}
                              onDelete={() => handleRemoveLabel(label)}
                              deleteIcon={<Close />}
                              variant="outlined"
                              size="small"
                              sx={{
                                borderRadius: '6px',
                                '& .MuiChip-deleteIcon': {
                                  fontSize: '16px',
                                }
                              }}
                            />
                          ))}
                        </Box>
                      )}

                      {/* Label suggestions */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Suggestions:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {labelSuggestions
                            .filter(suggestion => !formData.labels.includes(suggestion))
                            .map((suggestion, index) => (
                            <Chip
                              key={index}
                              label={suggestion}
                              onClick={() => {
                                if (!formData.labels.includes(suggestion)) {
                                  setFormData(prev => ({
                                    ...prev,
                                    labels: [...prev.labels, suggestion]
                                  }));
                                }
                              }}
                              variant="outlined"
                              size="small"
                              clickable
                              sx={{
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
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
                    {isLoading ? 'Submitting...' : 'Submit'}
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

      {/* Logout Confirmation Dialog */}
      <Dialog 
        open={showLogoutDialog} 
        onClose={() => setShowLogoutDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Logout color="error" />
            <Typography variant="h6">
              Confirm Logout
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to logout?
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setShowLogoutDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: '10px',
              px: 3,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowLogoutDialog(false);
              handleLogout();
            }}
            variant="contained"
            startIcon={<Logout />}
            sx={{
              borderRadius: '10px',
              px: 3,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 500,
              backgroundColor: 'error.main',
              '&:hover': {
                backgroundColor: 'error.dark',
              }
            }}
          >
            Logout
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
