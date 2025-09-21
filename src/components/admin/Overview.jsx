import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  Article as ArticleIcon,
  Mail as MailIcon,
  Chat as ChatIcon,
  VolunteerActivism as VolunteerIcon,
  AttachMoney as DonationIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  PersonAdd as UserIcon,
} from '@mui/icons-material';
import API from '../../BackendAPi/ApiProvider';
import { useNetwork } from '../../contexts/NetworkContext';
import OfflineMessage from './OfflineMessage';

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [recentData, setRecentData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const { isOnline } = useNetwork();

  const handleRetry = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (isOnline) {
      fetchDashboardData();
    }
  }, [isOnline]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, recentDataResponse] = await Promise.all([
        API.get('/api/admin/stats'),
        API.get('/api/admin/recent-data')
      ]);
      
      setStats(statsResponse.data);
      setRecentData(recentDataResponse.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'published':
      case 'approved':
        return 'success';
      case 'pending':
      case 'draft':
        return 'warning';
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Show offline message when offline
  if (!isOnline) {
    return <OfflineMessage onRetry={handleRetry} showCreateContact={true} />;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Dashboard Overview
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.warning.main, mr: 2 }}>
                  <UserIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Customers
                  </Typography>
                  <Typography variant="h4">
                    {stats?.customers?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats?.customers?.subscribed || 0} subscribed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>
                  <ArticleIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Blogs
                  </Typography>
                  <Typography variant="h4">
                    {stats?.blogs?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats?.blogs?.published || 0} published
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.info.main, mr: 2 }}>
                  <DonationIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Donations
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(stats?.donations?.totalAmount || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats?.donations?.totalCount || 0} donations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Recent Data Tables */}
      <Grid container spacing={3}>
        {/* Recent Blogs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Blogs
            </Typography>
            {recentData.blogs && recentData.blogs.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Views</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentData.blogs.slice(0, 5).map((blog) => (
                      <TableRow key={blog._id}>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                            {blog.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={blog.status}
                            size="small"
                            color={getStatusColor(blog.status)}
                          />
                        </TableCell>
                        <TableCell>{blog.views || 0}</TableCell>
                        <TableCell>{formatDate(blog.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                <Typography variant="body2" color="textSecondary">
                  No blogs found
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Donations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Donations
            </Typography>
            {recentData.donations && recentData.donations.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Donor</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentData.donations.slice(0, 5).map((donation) => (
                      <TableRow key={donation._id}>
                        <TableCell>
                          {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                        </TableCell>
                        <TableCell>{formatCurrency(donation.amount)}</TableCell>
                        <TableCell>
                          <Chip
                            label={donation.status}
                            size="small"
                            color={getStatusColor(donation.status)}
                          />
                        </TableCell>
                        <TableCell>{formatDate(donation.submittedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                <Typography variant="body2" color="textSecondary">
                  No donations found
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        {/* Recent Customers */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Customers
            </Typography>
            {recentData.customers && recentData.customers.length > 0 ? (
              <List dense>
                {recentData.customers.slice(0, 5).map((customer) => (
                  <React.Fragment key={customer._id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          {customer.firstName ? customer.firstName.charAt(0).toUpperCase() : 
                           customer.email.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          customer.firstName && customer.lastName 
                            ? `${customer.firstName} ${customer.lastName}`
                            : customer.firstName || customer.lastName || customer.email
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {customer.email} • {formatDate(customer.createdAt)}
                            </Typography>
                            <Chip
                              label={customer.isSubscribed ? 'Subscribed' : 'Unsubscribed'}
                              size="small"
                              color={customer.isSubscribed ? 'success' : 'default'}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                <Typography variant="body2" color="textSecondary">
                  No customers found
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;
