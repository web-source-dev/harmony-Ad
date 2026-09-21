import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import API from '../../BackendAPi/ApiProvider';

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

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
      .map(([k, v]) => `${k}: ${v}`)
      .join(' · ') || '—';
  }
  return String(value);
};

const DetailRow = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
      {formatValue(value)}
    </Typography>
  </Grid>
);

const DetailSection = ({ title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
      {title}
    </Typography>
    <Grid container spacing={2}>
      {children}
    </Grid>
  </Box>
);

const PartnershipAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/api/partnership');
      setAgreements(response.data);
    } catch (err) {
      setError('Failed to load partnership submissions');
      console.error('Partnership agreements fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async (agreement) => {
    try {
      setDownloadingId(agreement._id);
      const response = await API.get(`/api/partnership/${agreement._id}/pdf`, {
        responseType: 'blob',
      });

      const safeEventName = (agreement.eventName || 'partnership')
        .replace(/[^a-z0-9]+/gi, '_')
        .slice(0, 60);
      const filename = `Harmony4All_Partnership_Agreement_${safeEventName}.pdf`;

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
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
      <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
        Partnership Agreements
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Community Performance Partnership form submissions from the public website.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          All Submissions ({agreements.length})
        </Typography>

        {agreements.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No partnership submissions yet.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Organizer</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agreements.map((agreement) => (
                  <TableRow key={agreement._id} hover>
                    <TableCell>{agreement.eventName || '—'}</TableCell>
                    <TableCell>{agreement.location || '—'}</TableCell>
                    <TableCell>{agreement.organizer?.name || '—'}</TableCell>
                    <TableCell>{agreement.organizer?.email || '—'}</TableCell>
                    <TableCell>{agreement.organizer?.phone || '—'}</TableCell>
                    <TableCell>{formatDate(agreement.submittedAt)}</TableCell>
                    <TableCell>
                      <Chip
                        label={agreement.status || 'submitted'}
                        size="small"
                        color={agreement.status === 'confirmed' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => setSelected(agreement)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download PDF">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => downloadPdf(agreement)}
                            disabled={downloadingId === agreement._id}
                          >
                            {downloadingId === agreement._id ? (
                              <CircularProgress size={18} />
                            ) : (
                              <DownloadIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        maxWidth="md"
        fullWidth
      >
        {selected && (
          <>
            <DialogTitle>
              {selected.eventName || 'Partnership Agreement'}
            </DialogTitle>
            <DialogContent dividers>
              <DetailSection title="At a Glance">
                <DetailRow label="Event name" value={selected.eventName} />
                <DetailRow label="Location" value={selected.location} />
                <DetailRow label="Expected attendance" value={selected.expectedAttendance} />
                <DetailRow label="Setting" value={selected.setting} />
                <DetailRow label="Audience phrase" value={selected.audiencePhrase} />
                <DetailRow label="Backup date 2" value={selected.backupDate2} />
                <DetailRow label="Backup date 3" value={selected.backupDate3} />
              </DetailSection>

              <Divider sx={{ my: 2 }} />

              <DetailSection title="Organizer">
                <DetailRow label="Name" value={selected.organizer?.name} />
                <DetailRow label="Title" value={selected.organizer?.title} />
                <DetailRow label="Email" value={selected.organizer?.email} />
                <DetailRow label="Phone" value={selected.organizer?.phone} />
                <DetailRow label="Organizer is venue" value={selected.organizerIsVenue} />
              </DetailSection>

              <DetailSection title="Venue Host">
                <DetailRow label="Name" value={selected.venueHost?.name} />
                <DetailRow label="Title" value={selected.venueHost?.title} />
                <DetailRow label="Email" value={selected.venueHost?.email} />
                <DetailRow label="Phone" value={selected.venueHost?.phone} />
              </DetailSection>

              <Divider sx={{ my: 2 }} />

              <DetailSection title="Services & Schedule">
                <DetailRow label="Services requested" value={selected.servicesRequested} />
                <DetailRow label="Other service" value={selected.otherService} />
                <DetailRow label="Purpose of event" value={selected.purposeOfEvent} />
                <DetailRow label="First choice" value={selected.firstChoice} />
                <DetailRow label="Second choice" value={selected.secondChoice} />
                <DetailRow label="Third choice" value={selected.thirdChoice} />
                <DetailRow label="Arrive / setup by" value={selected.arriveSetupBy} />
                <DetailRow label="We play" value={selected.wePlay} />
                <DetailRow label="We finish" value={selected.weFinish} />
                <DetailRow label="Packed out by" value={selected.packedOutBy} />
              </DetailSection>

              <DetailSection title="Audience">
                <DetailRow label="Audience types" value={selected.audienceTypes} />
                <DetailRow label="Other audience type" value={selected.otherAudienceType} />
                <DetailRow label="Age range" value={selected.ageRange} />
                <DetailRow label="Audience flow" value={selected.audienceFlow} />
                <DetailRow label="Community notes" value={selected.communityNotes} />
              </DetailSection>

              <DetailSection title="Logistics">
                <DetailRow label="Preview items" value={selected.previewItems} />
                <DetailRow label="Chairs for musicians" value={selected.chairsForMusicians} />
                <DetailRow label="Musician chair count" value={selected.chairsForMusiciansCount} />
                <DetailRow label="Chairs for volunteers" value={selected.chairsForVolunteers} />
                <DetailRow label="Volunteer chair count" value={selected.chairsForVolunteersCount} />
                <DetailRow label="Outreach table provider" value={selected.outreachTableProvider} />
                <DetailRow label="Power outlet" value={selected.powerOutlet} />
                <DetailRow label="Power outlet location" value={selected.powerOutletLocation} />
                <DetailRow label="Amplified sound" value={selected.amplifiedSound} />
                <DetailRow label="Banner floor space" value={selected.bannerFloorSpace} />
                <DetailRow label="Backdrop room" value={selected.backdropRoom} />
                <DetailRow label="Outreach table location" value={selected.outreachTableLocation} />
                <DetailRow label="Parking / loading notes" value={selected.parkingLoadingNotes} />
                <DetailRow label="Entry instructions" value={selected.entryInstructions} />
                <DetailRow label="Day-of contact" value={`${selected.dayOfContactName || ''} ${selected.dayOfContactPhone || ''}`.trim()} />
              </DetailSection>

              <DetailSection title="Compensation & Other">
                <DetailRow label="Compensation type" value={selected.eventCompensationType} />
                <DetailRow label="Compensation amount" value={selected.compensationAmount} />
                <DetailRow label="Compensation due by" value={selected.compensationDueBy} />
                <DetailRow label="How paid" value={selected.compensationHowPaid} />
                <DetailRow label="Permits confirmed" value={selected.permitsConfirmed} />
                <DetailRow label="Photo/video sensitivities" value={selected.photoVideoSensitivities} />
                <DetailRow label="Go / no-go time" value={selected.goNoGoTime} />
                <DetailRow label="Weather backup plan" value={selected.weatherBackupPlan} />
                <DetailRow label="Setting notes" value={selected.settingNotes} />
                <DetailRow label="Accessibility notes" value={selected.accessibilityNotes} />
                <DetailRow label="Break / food notes" value={selected.breakNotesFood} />
              </DetailSection>

              <DetailSection title="Signatures">
                <DetailRow label="Organizer signature" value={selected.organizerSignature} />
                <DetailRow label="Venue host signature" value={selected.venueHostSignature} />
                <DetailRow label="Agreed to terms" value={selected.agreeToTerms} />
                <DetailRow label="Submitted at" value={formatDate(selected.submittedAt)} />
              </DetailSection>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelected(null)}>Close</Button>
              <Button
                variant="contained"
                startIcon={downloadingId === selected._id ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                onClick={() => downloadPdf(selected)}
                disabled={downloadingId === selected._id}
              >
                Download PDF
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PartnershipAgreements;
