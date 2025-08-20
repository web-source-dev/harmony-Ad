import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
  useTheme,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Autocomplete,
  OutlinedInput,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import API from '../../BackendAPi/ApiProvider';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phone1: '',
    phone2: '',
    address: '',
    address1Street: '',
    address1City: '',
    address1State: '',
    address1Zip: '',
    address1Country: '',
    address2Street: '',
    address2City: '',
    address2State: '',
    address2Zip: '',
    address2Country: '',
    address3Street: '',
    address3StreetLine2: '',
    address3City: '',
    address3Country: '',
    position: '',
    labels: [],
    isSubscribed: true,
    emailSubscriberStatus: 'subscribed',
    smsSubscriberStatus: 'subscribed',
    source: 'website'
  });
  const [formErrors, setFormErrors] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState({
    search: '',
    subscriptionStatus: '',
    emailStatus: '',
    smsStatus: '',
    source: '',
    labels: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [availableSources, setAvailableSources] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    fetchCustomers();
  }, [page, limit, filters]);

  useEffect(() => {
    fetchSourcesAndLabels();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''))
      });
      
      const response = await API.get(`/api/admin/customers?${params}`);
      setCustomers(response.data.customers);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load customers');
      console.error('Customers fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSourcesAndLabels = async () => {
    try {
      const [sourcesResponse, labelsResponse] = await Promise.all([
        API.get('/api/admin/customers/sources'),
        API.get('/api/admin/customers/labels')
      ]);
      
      setAvailableSources(sourcesResponse.data);
      setAvailableLabels(labelsResponse.data);
    } catch (err) {
      console.error('Error fetching sources and labels:', err);
    }
  };

  const handleOpenDialog = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        phone1: customer.phone1 || '',
        phone2: customer.phone2 || '',
        address: customer.address || '',
        address1Street: customer.address1Street || '',
        address1City: customer.address1City || '',
        address1State: customer.address1State || '',
        address1Zip: customer.address1Zip || '',
        address1Country: customer.address1Country || '',
        address2Street: customer.address2Street || '',
        address2City: customer.address2City || '',
        address2State: customer.address2State || '',
        address2Zip: customer.address2Zip || '',
        address2Country: customer.address2Country || '',
        address3Street: customer.address3Street || '',
        address3StreetLine2: customer.address3StreetLine2 || '',
        address3City: customer.address3City || '',
        address3Country: customer.address3Country || '',
        position: customer.position || '',
        labels: customer.labels || [],
        isSubscribed: customer.isSubscribed,
        emailSubscriberStatus: customer.emailSubscriberStatus || 'subscribed',
        smsSubscriberStatus: customer.smsSubscriberStatus || 'subscribed',
        source: customer.source || 'website'
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        phone1: '',
        phone2: '',
        address: '',
        address1Street: '',
        address1City: '',
        address1State: '',
        address1Zip: '',
        address1Country: '',
        address2Street: '',
        address2City: '',
        address2State: '',
        address2Zip: '',
        address2Country: '',
        address3Street: '',
        address3StreetLine2: '',
        address3City: '',
        address3Country: '',
        position: '',
        labels: [],
        isSubscribed: true,
        emailSubscriberStatus: 'subscribed',
        smsSubscriberStatus: 'subscribed',
        source: 'website'
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      phone1: '',
      phone2: '',
      address: '',
      address1Street: '',
      address1City: '',
      address1State: '',
      address1Zip: '',
      address1Country: '',
      address2Street: '',
      address2City: '',
      address2State: '',
      address2Zip: '',
      address2Country: '',
      address3Street: '',
      address3StreetLine2: '',
      address3City: '',
      address3Country: '',
      position: '',
      labels: [],
      isSubscribed: true,
      emailSubscriberStatus: 'subscribed',
      smsSubscriberStatus: 'subscribed',
      source: 'website'
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingCustomer) {
        await API.put(`/api/admin/customers/${editingCustomer._id}`, formData);
      } else {
        await API.post('/api/admin/customers', formData);
      }
      handleCloseDialog();
      fetchCustomers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save customer';
      setFormErrors({ submit: errorMessage });
    }
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      await API.delete(`/api/admin/customers/${customerId}`);
      fetchCustomers();
    } catch (err) {
      setError('Failed to delete customer');
      console.error('Delete customer error:', err);
    }
  };

  const handleToggleSubscription = async (customerId) => {
    try {
      await API.patch(`/api/admin/customers/${customerId}/toggle-subscription`);
      fetchCustomers();
    } catch (err) {
      setError('Failed to toggle subscription');
      console.error('Toggle subscription error:', err);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
    setPage(1); // Reset to first page when changing limit
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when changing filters
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      subscriptionStatus: '',
      emailStatus: '',
      smsStatus: '',
      source: '',
      labels: '',
      dateFrom: '',
      dateTo: ''
    });
    setPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Customers</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Customer
          </Button>
        </Box>
      </Box>

             {/* Filters Section */}
       {showFilters && (
         <Paper sx={{ mb: 3, p: 2 }}>
           <Grid container spacing={2}>
             <Grid item xs={12} md={2}>
               <TextField
                 fullWidth
                 size="small"
                 label="Search"
                 placeholder="Name, email, phone..."
                 value={filters.search}
                 onChange={(e) => handleFilterChange('search', e.target.value)}
               />
             </Grid>
             <Grid item xs={12} md={2}>
               <FormControl fullWidth size="small">
                 <InputLabel>Subscription</InputLabel>
                 <Select
                   value={filters.subscriptionStatus}
                   label="Subscription"
                   onChange={(e) => handleFilterChange('subscriptionStatus', e.target.value)}
                 >
                   <MenuItem value="">All</MenuItem>
                   <MenuItem value="subscribed">Subscribed</MenuItem>
                   <MenuItem value="unsubscribed">Unsubscribed</MenuItem>
                 </Select>
               </FormControl>
             </Grid>
             <Grid item xs={12} md={2}>
               <FormControl fullWidth size="small">
                 <InputLabel>Email Status</InputLabel>
                 <Select
                   value={filters.emailStatus}
                   label="Email Status"
                   onChange={(e) => handleFilterChange('emailStatus', e.target.value)}
                 >
                   <MenuItem value="">All</MenuItem>
                   <MenuItem value="subscribed">Subscribed</MenuItem>
                   <MenuItem value="unsubscribed">Unsubscribed</MenuItem>
                   <MenuItem value="pending">Pending</MenuItem>
                 </Select>
               </FormControl>
             </Grid>
             <Grid item xs={12} md={2}>
               <FormControl fullWidth size="small">
                 <InputLabel>SMS Status</InputLabel>
                 <Select
                   value={filters.smsStatus}
                   label="SMS Status"
                   onChange={(e) => handleFilterChange('smsStatus', e.target.value)}
                 >
                   <MenuItem value="">All</MenuItem>
                   <MenuItem value="subscribed">Subscribed</MenuItem>
                   <MenuItem value="unsubscribed">Unsubscribed</MenuItem>
                   <MenuItem value="pending">Pending</MenuItem>
                 </Select>
               </FormControl>
             </Grid>
             <Grid item xs={12} md={2}>
               <FormControl fullWidth size="small">
                 <InputLabel>Source</InputLabel>
                 <Select
                   value={filters.source}
                   label="Source"
                   onChange={(e) => handleFilterChange('source', e.target.value)}
                 >
                   <MenuItem value="">All</MenuItem>
                   {availableSources.map((source) => (
                     <MenuItem key={source} value={source}>
                       {source}
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
             </Grid>
             <Grid item xs={12} md={2}>
               <FormControl fullWidth size="small">
                 <InputLabel>Labels</InputLabel>
                 <Select
                   value={filters.labels}
                   label="Labels"
                   onChange={(e) => handleFilterChange('labels', e.target.value)}
                 >
                   <MenuItem value="">All</MenuItem>
                   {availableLabels.map((label) => (
                     <MenuItem key={label} value={label}>
                       {label}
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
             </Grid>
        
             <Grid item xs={12} md={11}>
               <Box display="flex" gap={2}>
                 <TextField
                   size="small"
                   label="Date From"
                   type="date"
                   value={filters.dateFrom}
                   onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                   InputLabelProps={{ shrink: true }}
                 />
                 <TextField
                   size="small"
                   label="Date To"
                   type="date"
                   value={filters.dateTo}
                   onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                   InputLabelProps={{ shrink: true }}
                 />
               </Box>
             </Grid>
             <Grid item xs={12} md={1}>
               <Button
                 fullWidth
                 variant="outlined"
                 size="small"
                 onClick={clearFilters}
               >
                 Clear
               </Button>
             </Grid>
           </Grid>
         </Paper>
       )}

      {/* Pagination Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="textSecondary">
            Show {pagination.totalCustomers > 0 ? (page - 1) * limit + 1 : 0} to{' '}
            {Math.min(page * limit, pagination.totalCustomers)} of {pagination.totalCustomers} customers
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Per Page</InputLabel>
          <Select
            value={limit}
            label="Per Page"
            onChange={handleLimitChange}
          >
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
                         <TableHead>
               <TableRow>
                 <TableCell>Customer</TableCell>
                 <TableCell>Contact</TableCell>
                 <TableCell>Address</TableCell>
                 <TableCell>Position</TableCell>
                 <TableCell>Labels</TableCell>
                 <TableCell>Subscription</TableCell>
                 <TableCell>Source</TableCell>
                 <TableCell>Joined</TableCell>
                 <TableCell align="center">Actions</TableCell>
               </TableRow>
             </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                        {customer.firstName ? customer.firstName.charAt(0).toUpperCase() : 
                         customer.email.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {customer.firstName && customer.lastName 
                            ? `${customer.firstName} ${customer.lastName}`
                            : customer.firstName || customer.lastName || 'N/A'
                          }
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {customer.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {customer.phone && (
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{customer.phone}</Typography>
                      </Box>
                    )}
                  </TableCell>
                                     <TableCell>
                     {customer.address1Street && (
                       <Box display="flex" alignItems="center">
                         <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                         <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                           {customer.address1Street}
                         </Typography>
                       </Box>
                     )}
                   </TableCell>
                   <TableCell>
                     <Typography variant="body2">
                       {customer.position || 'N/A'}
                     </Typography>
                   </TableCell>
                   <TableCell>
                     <Box display="flex" flexWrap="wrap" gap={0.5}>
                       {customer.labels && customer.labels.length > 0 ? (
                         customer.labels.slice(0, 2).map((label, index) => (
                           <Chip
                             key={index}
                             label={label}
                             size="small"
                             variant="outlined"
                           />
                         ))
                       ) : (
                         <Typography variant="body2" color="textSecondary">No labels</Typography>
                       )}
                       {customer.labels && customer.labels.length > 2 && (
                         <Chip
                           label={`+${customer.labels.length - 2}`}
                           size="small"
                           variant="outlined"
                         />
                       )}
                     </Box>
                   </TableCell>
                   <TableCell>
                     <Box>
                       <Chip
                         label={customer.isSubscribed ? 'Subscribed' : 'Unsubscribed'}
                         color={customer.isSubscribed ? 'success' : 'default'}
                         size="small"
                         onClick={() => handleToggleSubscription(customer._id)}
                         sx={{ cursor: 'pointer', mb: 0.5 }}
                       />
                       <Typography variant="caption" display="block" color="textSecondary">
                         Email: {customer.emailSubscriberStatus || 'N/A'}
                       </Typography>
                       <Typography variant="caption" display="block" color="textSecondary">
                         SMS: {customer.smsSubscriberStatus || 'N/A'}
                       </Typography>
                     </Box>
                   </TableCell>
                   <TableCell>
                     <Chip
                       label={customer.source || 'website'}
                       size="small"
                       variant="outlined"
                     />
                   </TableCell>
                   <TableCell>
                     <Typography variant="body2">
                       {formatDate(customer.createdAt)}
                     </Typography>
                   </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <Tooltip title="Edit Customer">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(customer)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Customer">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(customer._id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Add/Edit Customer Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {formErrors.submit && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formErrors.submit}
              </Alert>
            )}
            
            {/* Basic Information */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Basic Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      error={!!formErrors.firstName}
                      helperText={formErrors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      error={!!formErrors.lastName}
                      helperText={formErrors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Phone 1"
                      value={formData.phone1}
                      onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Phone 2"
                      value={formData.phone2}
                      onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Address Information */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Address Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>Address 1</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street"
                      value={formData.address1Street}
                      onChange={(e) => setFormData({ ...formData, address1Street: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="City"
                      value={formData.address1City}
                      onChange={(e) => setFormData({ ...formData, address1City: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="State/Region"
                      value={formData.address1State}
                      onChange={(e) => setFormData({ ...formData, address1State: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      value={formData.address1Zip}
                      onChange={(e) => setFormData({ ...formData, address1Zip: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={formData.address1Country}
                      onChange={(e) => setFormData({ ...formData, address1Country: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Additional Information */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Additional Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={formData.labels}
                      onChange={(event, newValue) => {
                        setFormData({ ...formData, labels: newValue });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Labels"
                          placeholder="Add labels (press Enter to add)"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Email Subscriber Status</InputLabel>
                      <Select
                        value={formData.emailSubscriberStatus}
                        label="Email Subscriber Status"
                        onChange={(e) => setFormData({ ...formData, emailSubscriberStatus: e.target.value })}
                      >
                        <MenuItem value="subscribed">Subscribed</MenuItem>
                        <MenuItem value="unsubscribed">Unsubscribed</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>SMS Subscriber Status</InputLabel>
                      <Select
                        value={formData.smsSubscriberStatus}
                        label="SMS Subscriber Status"
                        onChange={(e) => setFormData({ ...formData, smsSubscriberStatus: e.target.value })}
                      >
                        <MenuItem value="subscribed">Subscribed</MenuItem>
                        <MenuItem value="unsubscribed">Unsubscribed</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                                     <Grid item xs={12} md={6}>
                     <FormControl fullWidth>
                       <InputLabel>Source</InputLabel>
                       <Select
                         value={formData.source}
                         label="Source"
                         onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                       >
                         <MenuItem value="website">Website</MenuItem>
                         <MenuItem value="csv_import">CSV Import</MenuItem>
                         {availableSources.filter(source => !['website', 'csv_import'].includes(source)).map((source) => (
                           <MenuItem key={source} value={source}>
                             {source}
                           </MenuItem>
                         ))}
                       </Select>
                     </FormControl>
                   </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isSubscribed}
                          onChange={(e) => setFormData({ ...formData, isSubscribed: e.target.checked })}
                        />
                      }
                      label="Subscribed to newsletter"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers;
