import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import API from '../../BackendAPi/ApiProvider';
import { useNetwork } from '../../contexts/NetworkContext';
import OfflineMessage from './OfflineMessage';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOnline } = useNetwork();

  const handleRetry = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (isOnline) {
      fetchDonations();
    }
  }, [isOnline]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/admin/donations');
      setDonations(response.data);
    } catch (err) {
      setError('Failed to load donations');
      console.error('Donations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

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
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Donations Management
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          All Donations ({donations.length})
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Donor</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation._id}>
                  <TableCell>
                    {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                  </TableCell>
                  <TableCell>{donation.email}</TableCell>
                  <TableCell>{formatCurrency(donation.amount)}</TableCell>
                  <TableCell>{donation.donationType}</TableCell>
                  <TableCell>{donation.designation}</TableCell>
                  <TableCell>
                    <Chip
                      label={donation.status}
                      color={getStatusColor(donation.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(donation.submittedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminDonations;
