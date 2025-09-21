import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Tabs,
  Tab,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  ThumbUp,
  Share,
  People,
  AttachMoney,
  Article,
  Email,
  Phone,
  CalendarToday,
  Refresh,
  Download,
  Analytics as AnalyticsIcon,
  Assessment,
  TableChart,
  ShowChart,
} from '@mui/icons-material';
import API from '../../BackendAPi/ApiProvider';
import AnalyticsExport from './AnalyticsExport';
import { useNetwork } from '../../contexts/NetworkContext';
import OfflineMessage from './OfflineMessage';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30');
  const [activeTab, setActiveTab] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const { isOnline } = useNetwork();
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    blogStats: [],
    donationStats: [],
    customerStats: [],
    engagementStats: [],
    topBlogs: [],
    topDonors: [],
    recentActivity: [],
  });

  const handleRetry = () => {
    window.location.reload();
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data
      const [
        statsResponse,
        blogsResponse,
        donationsResponse,
        customersResponse,
        contactsResponse,
        newslettersResponse,
        volunteersResponse,
        welcomePopupsResponse,
      ] = await Promise.all([
        API.get('api/admin/stats'),
        API.get('api/blogs/all'),
        API.get('api/admin/donations'),
        API.get('api/admin/customers'),
        API.get('api/contact'),
        API.get('api/newsletter'),
        API.get('api/volunteer'),
        API.get('api/welcome-popup'),
      ]);

      // Ensure we have valid data arrays
      const blogs = Array.isArray(blogsResponse.data) ? blogsResponse.data : [];
      const donations = Array.isArray(donationsResponse.data) ? donationsResponse.data : [];
      const customers = Array.isArray(customersResponse.data) ? customersResponse.data : [];
      const contacts = Array.isArray(contactsResponse.data) ? contactsResponse.data : [];
      const newsletters = Array.isArray(newslettersResponse.data) ? newslettersResponse.data : [];
      const volunteers = Array.isArray(volunteersResponse.data) ? volunteersResponse.data : [];
      const welcomePopups = Array.isArray(welcomePopupsResponse.data) ? welcomePopupsResponse.data : [];

      // Process data for analytics
      const processedData = processAnalyticsData(
        statsResponse.data,
        blogs,
        donations,
        customers,
        contacts,
        newsletters,
        volunteers,
        welcomePopups,
        timeRange
      );

      setAnalyticsData(processedData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      
      let errorMessage = 'Failed to load analytics data. Please try again.';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to view analytics.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (stats, blogs, donations, customers, contacts, newsletters, volunteers, welcomePopups, range) => {
    const days = parseInt(range);
    const now = new Date();
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

    // Ensure all data is in array format
    const safeBlogs = Array.isArray(blogs) ? blogs : [];
    const safeDonations = Array.isArray(donations) ? donations : [];
    const safeCustomers = Array.isArray(customers) ? customers : [];
    const safeContacts = Array.isArray(contacts) ? contacts : [];
    const safeNewsletters = Array.isArray(newsletters) ? newsletters : [];
    const safeVolunteers = Array.isArray(volunteers) ? volunteers : [];
    const safeWelcomePopups = Array.isArray(welcomePopups) ? welcomePopups : [];

    // Filter data by time range
    const filteredBlogs = safeBlogs.filter(blog => blog && blog.createdAt && new Date(blog.createdAt) >= startDate);
    const filteredDonations = safeDonations.filter(donation => donation && donation.submittedAt && new Date(donation.submittedAt) >= startDate);
    const filteredCustomers = safeCustomers.filter(customer => customer && customer.createdAt && new Date(customer.createdAt) >= startDate);
    const filteredContacts = safeContacts.filter(contact => contact && contact.createdAt && new Date(contact.createdAt) >= startDate);
    const filteredNewsletters = safeNewsletters.filter(newsletter => newsletter && newsletter.subscribedAt && new Date(newsletter.subscribedAt) >= startDate);
    const filteredVolunteers = safeVolunteers.filter(volunteer => volunteer && volunteer.submittedAt && new Date(volunteer.submittedAt) >= startDate);
    const filteredWelcomePopups = safeWelcomePopups.filter(popup => popup && popup.submittedAt && new Date(popup.submittedAt) >= startDate);

    // Calculate engagement metrics
    const totalViews = safeBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
    const totalLikes = safeBlogs.reduce((sum, blog) => sum + (blog.likes || 0), 0);
    const totalShares = safeBlogs.reduce((sum, blog) => sum + (blog.shares || 0), 0);

    // Top performing blogs
    const topBlogs = safeBlogs
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10)
      .map(blog => ({
        title: blog.title,
        views: blog.views || 0,
        likes: blog.likes || 0,
        shares: blog.shares || 0,
        status: blog.status,
        createdAt: blog.createdAt,
      }));

    // Top donors
    const topDonors = safeDonations
      .filter(d => d && d.status === 'completed')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map(donation => ({
        name: donation.isAnonymous ? 'Anonymous' : donation.donorName,
        amount: donation.amount,
        type: donation.donationType,
        date: donation.submittedAt,
      }));

    // Recent activity
    const recentActivity = [
      ...filteredBlogs.map(blog => ({ type: 'blog', data: blog, date: blog.createdAt })),
      ...filteredDonations.map(donation => ({ type: 'donation', data: donation, date: donation.submittedAt })),
      ...filteredCustomers.map(customer => ({ type: 'customer', data: customer, date: customer.createdAt })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);

    return {
      overview: {
        totalBlogs: safeBlogs.length,
        publishedBlogs: safeBlogs.filter(b => b && b.status === 'published').length,
        draftBlogs: safeBlogs.filter(b => b && b.status === 'draft').length,
        scheduledBlogs: safeBlogs.filter(b => b && b.status === 'scheduled').length,
        totalDonations: safeDonations.length,
        completedDonations: safeDonations.filter(d => d && d.status === 'completed').length,
        totalAmount: safeDonations.filter(d => d && d.status === 'completed').reduce((sum, d) => sum + (d.amount || 0), 0),
        totalCustomers: safeCustomers.length,
        subscribedCustomers: safeCustomers.filter(c => c && c.isSubscribed).length,
        totalContacts: safeContacts.length,
        totalNewsletters: safeNewsletters.length,
        totalVolunteers: safeVolunteers.length,
        totalWelcomePopups: safeWelcomePopups.length,
        totalViews,
        totalLikes,
        totalShares,
        averageViewsPerBlog: safeBlogs.length > 0 ? Math.round(totalViews / safeBlogs.length) : 0,
        averageLikesPerBlog: safeBlogs.length > 0 ? Math.round(totalLikes / safeBlogs.length) : 0,
        averageSharesPerBlog: safeBlogs.length > 0 ? Math.round(totalShares / safeBlogs.length) : 0,
      },
      blogStats: {
        blogsCreatedThisPeriod: filteredBlogs.length,
        blogsPublishedThisPeriod: filteredBlogs.filter(b => b && b.status === 'published').length,
        averageViewsThisPeriod: filteredBlogs.length > 0 ? Math.round(filteredBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0) / filteredBlogs.length) : 0,
      },
      donationStats: {
        donationsThisPeriod: filteredDonations.length,
        amountThisPeriod: filteredDonations.filter(d => d && d.status === 'completed').reduce((sum, d) => sum + (d.amount || 0), 0),
        averageDonation: safeDonations.filter(d => d && d.status === 'completed').length > 0 ? Math.round(safeDonations.filter(d => d && d.status === 'completed').reduce((sum, d) => sum + (d.amount || 0), 0) / safeDonations.filter(d => d && d.status === 'completed').length) : 0,
      },
      customerStats: {
        newCustomersThisPeriod: filteredCustomers.length,
        newSubscribersThisPeriod: filteredCustomers.filter(c => c && c.isSubscribed).length,
        totalSubscribers: safeCustomers.filter(c => c && c.isSubscribed).length,
        subscriptionRate: safeCustomers.length > 0 ? Math.round((safeCustomers.filter(c => c && c.isSubscribed).length / safeCustomers.length) * 100) : 0,
      },
      engagementStats: {
        totalViews,
        totalLikes,
        totalShares,
        averageViewsPerBlog: safeBlogs.length > 0 ? Math.round(totalViews / safeBlogs.length) : 0,
        averageLikesPerBlog: safeBlogs.length > 0 ? Math.round(totalLikes / safeBlogs.length) : 0,
        averageSharesPerBlog: safeBlogs.length > 0 ? Math.round(totalShares / safeBlogs.length) : 0,
      },
      topBlogs,
      topDonors,
      recentActivity,
    };
  };

  useEffect(() => {
    if (isOnline) {
      fetchAnalyticsData();
    }
  }, [timeRange, isOnline]);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExport = () => {
    setShowExport(true);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Show offline message when offline
  if (!isOnline) {
    return <OfflineMessage onRetry={handleRetry} autoRedirect={true} />;
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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <AnalyticsIcon color="primary" />
          <Typography variant="h4" fontWeight="bold">
            Analytics Dashboard
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Data">
            <IconButton onClick={handleExport}>
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Blogs
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {analyticsData.overview.totalBlogs}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    <TrendingUp fontSize="small" /> {analyticsData.overview.publishedBlogs} Published
                  </Typography>
                </Box>
                <Article color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Donations
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${analyticsData.overview.totalAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    <TrendingUp fontSize="small" /> {analyticsData.overview.completedDonations} Completed
                  </Typography>
                </Box>
                <AttachMoney color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Customers
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {analyticsData.overview.totalCustomers}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    <TrendingUp fontSize="small" /> {analyticsData.overview.subscribedCustomers} Subscribed
                  </Typography>
                </Box>
                <People color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Views
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {analyticsData.overview.totalViews.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    <TrendingUp fontSize="small" /> {analyticsData.overview.averageViewsPerBlog} Avg/Post
                  </Typography>
                </Box>
                <Visibility color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Likes
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {analyticsData.overview.totalLikes.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    <TrendingUp fontSize="small" /> {analyticsData.overview.averageLikesPerBlog} Avg/Post
                  </Typography>
                </Box>
                <ThumbUp color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Shares
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {analyticsData.overview.totalShares.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    <TrendingUp fontSize="small" /> {analyticsData.overview.averageSharesPerBlog} Avg/Post
                  </Typography>
                </Box>
                <Share color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Subscription Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {analyticsData.overview.subscriptionRate}%
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    <TrendingUp fontSize="small" /> {analyticsData.overview.subscribedCustomers} Subscribers
                  </Typography>
                </Box>
                <Email color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Donation
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${analyticsData.overview.averageDonation}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    <TrendingUp fontSize="small" /> {analyticsData.overview.completedDonations} Transactions
                  </Typography>
                </Box>
                <AttachMoney color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Blog Statistics" icon={<Article />} />
          <Tab label="Top Performers" icon={<TrendingUp />} />
          <Tab label="Recent Activity" icon={<TableChart />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Blog Status Distribution
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="Published" color="success" size="small" />
                      <Typography>Published Blogs</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {analyticsData.overview.publishedBlogs}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="Draft" color="default" size="small" />
                      <Typography>Draft Blogs</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {analyticsData.overview.draftBlogs}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="Scheduled" color="warning" size="small" />
                      <Typography>Scheduled Blogs</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {analyticsData.overview.scheduledBlogs}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Period Statistics (Last {timeRange} days)
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Blogs Created</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {analyticsData.blogStats.blogsCreatedThisPeriod}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Blogs Published</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {analyticsData.blogStats.blogsPublishedThisPeriod}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>New Customers</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {analyticsData.customerStats.newCustomersThisPeriod}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>New Donations</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {analyticsData.donationStats.donationsThisPeriod}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>Donation Amount</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ${analyticsData.donationStats.amountThisPeriod.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Performing Blogs
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Blog Title</TableCell>
                        <TableCell align="right">Views</TableCell>
                        <TableCell align="right">Likes</TableCell>
                        <TableCell align="right">Shares</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.topBlogs.slice(0, 10).map((blog, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {blog.title}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              {blog.views.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {blog.likes.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {blog.shares.toLocaleString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Donors
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Donor Name</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.topDonors.slice(0, 10).map((donor, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2">
                              {donor.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              ${donor.amount.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {donor.type}
                        </Typography>
                          </TableCell>
                        </TableRow>
                  ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List>
            {analyticsData.recentActivity.map((activity, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: COLORS[index % COLORS.length] }}>
                      {activity.type === 'blog' && <Article />}
                      {activity.type === 'donation' && <AttachMoney />}
                      {activity.type === 'customer' && <People />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      activity.type === 'blog' ? activity.data.title :
                      activity.type === 'donation' ? `${activity.data.donorName} donated $${activity.data.amount}` :
                      `${activity.data.firstName} ${activity.data.lastName} joined`
                    }
                    secondary={new Date(activity.date).toLocaleString()}
                  />
                  <Chip
                    label={activity.type}
                    size="small"
                    color="primary"
                  />
                </ListItem>
                {index < analyticsData.recentActivity.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
      )}

      {/* Export Dialog */}
      <AnalyticsExport
        open={showExport}
        onClose={() => setShowExport(false)}
        analyticsData={analyticsData}
      />
    </Box>
  );
};

export default Analytics;
