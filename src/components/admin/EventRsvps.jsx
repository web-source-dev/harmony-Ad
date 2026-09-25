import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import API from '../../BackendAPi/ApiProvider';

const QR_TARGET_URL = 'https://harmony4all.org/rsvp/qr';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const StatCard = ({ label, value, hint }) => (
  <Grid item xs={12} sm={4}>
    <Paper sx={{ p: 3 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 600, my: 1 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {hint}
      </Typography>
    </Paper>
  </Grid>
);

const EventRsvps = () => {
  const [rsvps, setRsvps] = useState([]);
  const [stats, setStats] = useState({ scans: 0, rsvps: 0, expectedAttendees: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsResponse, listResponse] = await Promise.all([
        API.get('/api/rsvp/qr/stats'),
        API.get('/api/rsvp/qr'),
      ]);
      setStats(statsResponse.data);
      setRsvps(listResponse.data);
    } catch (err) {
      setError('Failed to load QR RSVPs');
      console.error('QR RSVP fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRsvp = async (rsvp) => {
    if (!window.confirm(`Remove the RSVP from ${rsvp.firstName} ${rsvp.lastName}?`)) return;
    try {
      await API.delete(`/api/rsvp/qr/${rsvp._id}`);
      fetchData();
    } catch (err) {
      console.error('QR RSVP delete error:', err);
      setError('Failed to delete RSVP. Please try again.');
    }
  };

  const exportCsv = () => {
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'People', 'Promotional Updates', 'Submitted'],
      ...rsvps.map((r) => [
        r.firstName,
        r.lastName,
        r.email,
        r.cellNumber,
        r.guests,
        r.promotionalUpdates ? 'Yes' : 'No',
        formatDate(r.submittedAt),
      ]),
    ];
    const csv = rows.map((row) => row.map(escape).join(',')).join('\n');
    const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Harmony4All_QR_RSVPs.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
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
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
            Event RSVPs (QR Code)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            RSVPs from people who scanned the event QR code. QR target: {QR_TARGET_URL}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportCsv} disabled={!rsvps.length}>
            Export CSV
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <StatCard label="Expected Attendees" value={stats.expectedAttendees} hint="Total people across all RSVPs" />
        <StatCard label="RSVPs" value={stats.rsvps} hint="Forms submitted (one per email)" />
        <StatCard label="QR Scans" value={stats.scans} hint="Visits to the QR page" />
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          All QR RSVPs ({rsvps.length})
        </Typography>

        {rsvps.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No QR RSVPs yet.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="center">People</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rsvps.map((rsvp) => (
                  <TableRow key={rsvp._id} hover>
                    <TableCell>{`${rsvp.firstName} ${rsvp.lastName}`}</TableCell>
                    <TableCell>{rsvp.email}</TableCell>
                    <TableCell>{rsvp.cellNumber}</TableCell>
                    <TableCell align="center">{rsvp.guests}</TableCell>
                    <TableCell>{formatDate(rsvp.submittedAt)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Remove">
                        <IconButton size="small" onClick={() => deleteRsvp(rsvp)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default EventRsvps;
