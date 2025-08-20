import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Download,
  TableChart,
  Assessment,
} from '@mui/icons-material';

const AnalyticsExport = ({ open, onClose, analyticsData }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedData, setSelectedData] = useState({
    overview: true,
    blogStats: true,
    donationStats: true,
    customerStats: true,
    engagementStats: true,
    topBlogs: true,
    topDonors: true,
    recentActivity: true,
  });
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    
    try {
      const exportData = {
        format: exportFormat,
        dateRange: dateRange,
        data: selectedData,
        timestamp: new Date().toISOString(),
        analytics: analyticsData,
      };

      if (exportFormat === 'csv') {
        await exportToCSV(exportData);
      } else if (exportFormat === 'json') {
        await exportToJSON(exportData);
      }

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async (data) => {
    const csvContent = generateCSVContent(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = async (data) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-export-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSVContent = (data) => {
    let csv = 'Category,Metric,Value,Date\n';
    
    // Overview data
    if (data.data.overview) {
      csv += `Overview,Total Blogs,${data.analytics.overview.totalBlogs},${new Date().toISOString()}\n`;
      csv += `Overview,Published Blogs,${data.analytics.overview.publishedBlogs},${new Date().toISOString()}\n`;
      csv += `Overview,Draft Blogs,${data.analytics.overview.draftBlogs},${new Date().toISOString()}\n`;
      csv += `Overview,Scheduled Blogs,${data.analytics.overview.scheduledBlogs},${new Date().toISOString()}\n`;
      csv += `Overview,Total Donations,${data.analytics.overview.totalDonations},${new Date().toISOString()}\n`;
      csv += `Overview,Completed Donations,${data.analytics.overview.completedDonations},${new Date().toISOString()}\n`;
      csv += `Overview,Total Amount,$${data.analytics.overview.totalAmount},${new Date().toISOString()}\n`;
      csv += `Overview,Total Customers,${data.analytics.overview.totalCustomers},${new Date().toISOString()}\n`;
      csv += `Overview,Subscribed Customers,${data.analytics.overview.subscribedCustomers},${new Date().toISOString()}\n`;
      csv += `Overview,Total Views,${data.analytics.overview.totalViews},${new Date().toISOString()}\n`;
      csv += `Overview,Total Likes,${data.analytics.overview.totalLikes},${new Date().toISOString()}\n`;
      csv += `Overview,Total Shares,${data.analytics.overview.totalShares},${new Date().toISOString()}\n`;
      csv += `Overview,Average Views Per Blog,${data.analytics.overview.averageViewsPerBlog},${new Date().toISOString()}\n`;
      csv += `Overview,Average Likes Per Blog,${data.analytics.overview.averageLikesPerBlog},${new Date().toISOString()}\n`;
      csv += `Overview,Average Shares Per Blog,${data.analytics.overview.averageSharesPerBlog},${new Date().toISOString()}\n`;
      csv += `Overview,Subscription Rate,${data.analytics.overview.subscriptionRate}%,${new Date().toISOString()}\n`;
      csv += `Overview,Average Donation,$${data.analytics.overview.averageDonation},${new Date().toISOString()}\n`;
    }

    // Blog stats
    if (data.data.blogStats) {
      csv += `Blog Stats,Blogs Created This Period,${data.analytics.blogStats.blogsCreatedThisPeriod},${new Date().toISOString()}\n`;
      csv += `Blog Stats,Blogs Published This Period,${data.analytics.blogStats.blogsPublishedThisPeriod},${new Date().toISOString()}\n`;
      csv += `Blog Stats,Average Views This Period,${data.analytics.blogStats.averageViewsThisPeriod},${new Date().toISOString()}\n`;
    }

    // Donation stats
    if (data.data.donationStats) {
      csv += `Donation Stats,Donations This Period,${data.analytics.donationStats.donationsThisPeriod},${new Date().toISOString()}\n`;
      csv += `Donation Stats,Amount This Period,$${data.analytics.donationStats.amountThisPeriod},${new Date().toISOString()}\n`;
      csv += `Donation Stats,Average Donation,$${data.analytics.donationStats.averageDonation},${new Date().toISOString()}\n`;
    }

    // Customer stats
    if (data.data.customerStats) {
      csv += `Customer Stats,New Customers This Period,${data.analytics.customerStats.newCustomersThisPeriod},${new Date().toISOString()}\n`;
      csv += `Customer Stats,New Subscribers This Period,${data.analytics.customerStats.newSubscribersThisPeriod},${new Date().toISOString()}\n`;
      csv += `Customer Stats,Total Subscribers,${data.analytics.customerStats.totalSubscribers},${new Date().toISOString()}\n`;
      csv += `Customer Stats,Subscription Rate,${data.analytics.customerStats.subscriptionRate}%,${new Date().toISOString()}\n`;
    }

    // Top blogs
    if (data.data.topBlogs) {
      data.analytics.topBlogs.forEach((blog, index) => {
        csv += `Top Blogs,${index + 1}. ${blog.title},${blog.views} views,${new Date().toISOString()}\n`;
      });
    }

    // Top donors
    if (data.data.topDonors) {
      data.analytics.topDonors.forEach((donor, index) => {
        csv += `Top Donors,${index + 1}. ${donor.name},$${donor.amount},${new Date(donor.date).toISOString()}\n`;
      });
    }

    return csv;
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedData).every(Boolean);
    const newSelection = {};
    Object.keys(selectedData).forEach(key => {
      newSelection[key] = !allSelected;
    });
    setSelectedData(newSelection);
  };

  const handleSelectData = (key) => {
    setSelectedData(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const dataOptions = [
    { key: 'overview', label: 'Overview Metrics', icon: <Assessment /> },
    { key: 'blogStats', label: 'Blog Statistics', icon: <TableChart /> },
    { key: 'donationStats', label: 'Donation Statistics', icon: <TableChart /> },
    { key: 'customerStats', label: 'Customer Statistics', icon: <TableChart /> },
    { key: 'engagementStats', label: 'Engagement Data', icon: <TableChart /> },
    { key: 'topBlogs', label: 'Top Performing Blogs', icon: <Assessment /> },
    { key: 'topDonors', label: 'Top Donors', icon: <Assessment /> },
    { key: 'recentActivity', label: 'Recent Activity', icon: <TableChart /> },
  ];

  const selectedCount = Object.values(selectedData).filter(Boolean).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Download color="primary" />
          <Typography variant="h6">Export Analytics Data</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Export Format */}
          <FormControl fullWidth>
            <InputLabel>Export Format</InputLabel>
            <Select
              value={exportFormat}
              label="Export Format"
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <MenuItem value="csv">
                <Box display="flex" alignItems="center" gap={1}>
                  <TableChart />
                  CSV (Excel compatible)
                </Box>
              </MenuItem>
              <MenuItem value="json">
                <Box display="flex" alignItems="center" gap={1}>
                  <Assessment />
                  JSON (Raw data)
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Date Range */}
          <FormControl fullWidth>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>

          {/* Data Selection */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Select Data to Export</Typography>
              <Button size="small" onClick={handleSelectAll}>
                {Object.values(selectedData).every(Boolean) ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>
            
            <FormGroup>
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={2}>
                {dataOptions.map((option) => (
                  <FormControlLabel
                    key={option.key}
                    control={
                      <Checkbox
                        checked={selectedData[option.key]}
                        onChange={() => handleSelectData(option.key)}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        {option.icon}
                        {option.label}
                      </Box>
                    }
                  />
                ))}
              </Box>
            </FormGroup>
            
            <Box mt={2}>
              <Chip 
                label={`${selectedCount} of ${dataOptions.length} data sets selected`}
                color={selectedCount > 0 ? 'primary' : 'default'}
                variant={selectedCount > 0 ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>

          {/* Export Info */}
          <Alert severity="info">
            <Typography variant="body2">
              The exported file will include all selected data for the specified date range. 
              {exportFormat === 'csv' && ' CSV format is compatible with Excel and other spreadsheet applications.'}
              {exportFormat === 'json' && ' JSON format provides raw data for further processing.'}
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={loading || selectedCount === 0}
          startIcon={loading ? <CircularProgress size={20} /> : <Download />}
        >
          {loading ? 'Exporting...' : 'Export Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnalyticsExport;
