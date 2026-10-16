import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckedInIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Email as ResendIcon,
  HowToReg as CheckInIcon,
  RadioButtonUnchecked as NotCheckedInIcon,
  EventBusy as EndIcon,
  LocationOn as LocationIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  TableChart as SheetIcon,
} from '@mui/icons-material';
import API from '../../BackendAPi/ApiProvider';
import RsvpEventFormDialog from './rsvp/RsvpEventFormDialog';
import {
  RSVP_URL,
  formatDateTime,
  formatEndDate,
  formatEventWhen,
  getErrorMessage,
  hasEnded,
} from './rsvp/rsvpEventUtils';

const StatCard = ({ label, value, hint }) => (
  <Grid item xs={12} sm={4}>
    <Paper sx={{ p: 3, height: '100%' }}>
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

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const fileSafe = (value) => String(value).replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'event';

const RsvpEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [sheetUrl, setSheetUrl] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    API.get('/api/rsvp/admin/sheets')
      .then((response) => setSheetUrl(response.data.enabled ? response.data.url : null))
      .catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [eventResponse, rsvpResponse] = await Promise.all([
        API.get(`/api/rsvp/admin/events/${id}`),
        API.get(`/api/rsvp/admin/events/${id}/rsvps`),
      ]);
      setEvent(eventResponse.data);
      setRsvps(rsvpResponse.data);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
      else setError(getErrorMessage(err, 'Failed to load event'));
    } finally {
      setLoading(false);
    }
  };

  const filteredRsvps = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rsvps;
    return rsvps.filter((r) =>
      [`${r.firstName} ${r.lastName}`, r.email, r.cellNumber, r.checkInCode].some((v) => String(v || '').toLowerCase().includes(term))
    );
  }, [rsvps, search]);

  const expectedAttendees = rsvps.reduce((sum, r) => sum + (r.guests || 0), 0);
  const checkedInRsvps = rsvps.filter((r) => r.checkedInAt);
  const checkedInPeople = checkedInRsvps.reduce((sum, r) => sum + (r.guests || 0), 0);

  const toggleCheckIn = async (rsvp) => {
    const checkedIn = !rsvp.checkedInAt;
    if (!checkedIn && !window.confirm(`Undo check-in for ${rsvp.firstName} ${rsvp.lastName}?`)) return;
    try {
      const response = await API.patch(`/api/rsvp/admin/rsvps/${rsvp._id}/check-in`, { checkedIn });
      setRsvps((prev) => prev.map((r) => (r._id === rsvp._id ? { ...r, checkedInAt: response.data.checkedInAt } : r)));
      setNotice(checkedIn ? `${rsvp.firstName} ${rsvp.lastName} checked in` : 'Check-in undone');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update check-in'));
    }
  };

  const resendConfirmation = async (rsvp) => {
    if (!window.confirm(`Re-send the confirmation email (with check-in QR) to ${rsvp.email}?`)) return;
    try {
      const response = await API.post(`/api/rsvp/admin/rsvps/${rsvp._id}/resend-confirmation`);
      setRsvps((prev) => prev.map((r) => (r._id === rsvp._id ? { ...r, checkInCode: response.data.checkInCode } : r)));
      setNotice(`Confirmation sent to ${rsvp.email}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send the confirmation email'));
    }
  };

  const toggleActive = async () => {
    const turningOn = !event.isActive;
    if (turningOn) {
      const ok = window.confirm(
        `Make "${event.title}" the live event on ${RSVP_URL}?

If another event is live, it will be turned off.`
      );
      if (!ok) return;
    }
    try {
      setToggling(true);
      const response = await API.patch(`/api/rsvp/admin/events/${event._id}/active`, { isActive: turningOn });
      setEvent((prev) => ({ ...prev, isActive: response.data.isActive }));
      setNotice(response.data.isActive ? 'Event is now live on /rsvp' : 'Event is turned off');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update event'));
    } finally {
      setToggling(false);
    }
  };

  const deleteRsvp = async (rsvp) => {
    if (!window.confirm(`Remove the RSVP from ${rsvp.firstName} ${rsvp.lastName} (${rsvp.guests} people)?`)) return;
    try {
      await API.delete(`/api/rsvp/admin/rsvps/${rsvp._id}`);
      setRsvps((prev) => prev.filter((r) => r._id !== rsvp._id));
      setNotice('RSVP removed');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete RSVP. Please try again.'));
    }
  };

  const exportCsv = () => {
    const rows = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'People', 'Promotional Updates', 'Submitted', 'Check-in Code', 'Checked In'],
      ...rsvps.map((r) => [
        r.firstName,
        r.lastName,
        r.email,
        r.cellNumber,
        r.guests,
        r.promotionalUpdates ? 'Yes' : 'No',
        formatDateTime(r.submittedAt),
        r.checkInCode || '',
        r.checkedInAt ? formatDateTime(r.checkedInAt) : '',
      ]),
    ];
    const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
    const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Harmony4All_RSVPs_${fileSafe(event.title)}.csv`);
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

  if (notFound || !event) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h5" gutterBottom>
          {notFound ? 'Event not found' : 'Could not load this event'}
        </Typography>
        {error && <Typography color="text.secondary">{error}</Typography>}
        <Button startIcon={<BackIcon />} onClick={() => navigate('/event-rsvps')} sx={{ mt: 2 }}>
          Back to RSVP Events
        </Button>
      </Box>
    );
  }

  const ended = hasEnded(event);
  const when = formatEventWhen(event);
  const flyer = event.flyer;

  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/event-rsvps')} sx={{ mb: 2 }}>
        All RSVP Events
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            {flyer && flyer.resourceType !== 'raw' ? (
              <Box component="a" href={flyer.url} target="_blank" rel="noopener noreferrer">
                <Box component="img" src={flyer.url} alt={`${event.title} flyer`} sx={{ width: '100%', borderRadius: 2, display: 'block' }} />
              </Box>
            ) : flyer ? (
              <Button fullWidth variant="outlined" startIcon={<PdfIcon />} href={flyer.url} target="_blank" rel="noopener noreferrer" sx={{ py: 4 }}>
                View PDF flyer
              </Button>
            ) : (
              <Box sx={{ borderRadius: 2, bgcolor: 'action.hover', py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No flyer uploaded
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={9}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={1}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {event.title}
              </Typography>
              <Chip
                label={event.isActive ? 'Live' : ended ? 'Ended' : 'Inactive'}
                color={event.isActive ? 'success' : 'default'}
                variant={event.isActive || ended ? 'filled' : 'outlined'}
                size="small"
              />
            </Box>
            {when && (
              <Typography color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                <CalendarIcon fontSize="small" /> {when}
              </Typography>
            )}
            {event.location && (
              <Typography color="text.secondary" display="flex" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
                <LocationIcon fontSize="small" /> {event.location}
              </Typography>
            )}
            <Typography color="text.secondary" display="flex" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
              <EndIcon fontSize="small" /> RSVPs {ended ? 'closed' : 'close'} {formatEndDate(event.endDate)}
            </Typography>
            {event.description && (
              <Typography variant="body2" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                {event.description}
              </Typography>
            )}

            <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
              <Switch checked={event.isActive} disabled={toggling || (ended && !event.isActive)} onChange={toggleActive} />
              <Typography variant="body2">
                {event.isActive
                  ? `Live on ${RSVP_URL}`
                  : ended
                    ? 'End date has passed — edit the event and set a later end date to make it live again'
                    : `Off — turn on to show this event on ${RSVP_URL}`}
              </Typography>
            </Box>

            <Box display="flex" gap={1} sx={{ mt: 2 }} flexWrap="wrap">
              <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setDialogOpen(true)}>
                Edit event
              </Button>
              <Button variant="contained" startIcon={<CheckInIcon />} onClick={() => window.open('/check-in', '_blank', 'noopener')}>
                Check-in desk
              </Button>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>
                Refresh
              </Button>
              {sheetUrl && (
                <Button
                  variant="outlined"
                  startIcon={<SheetIcon />}
                  href={event.sheetTabId != null ? `${sheetUrl}#gid=${event.sheetTabId}` : sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Sheets
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <StatCard label="Expected Attendees" value={expectedAttendees} hint="Total people across all RSVPs" />
        <StatCard label="RSVPs" value={rsvps.length} hint="Forms submitted (one per email)" />
        <StatCard
          label="Checked In"
          value={`${checkedInPeople} / ${expectedAttendees}`}
          hint={`People arrived (${checkedInRsvps.length} of ${rsvps.length} RSVPs)`}
        />
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
          <Typography variant="h6">RSVPs ({rsvps.length})</Typography>
          <Box display="flex" gap={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Search name, email, phone, code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportCsv} disabled={!rsvps.length}>
              Export CSV
            </Button>
          </Box>
        </Box>

        {rsvps.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No RSVPs yet.{!event.isActive && !ended && ' Turn the event on so people can RSVP.'}
          </Typography>
        ) : filteredRsvps.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No RSVPs match "{search}".
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
                  <TableCell align="center">Checked In</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRsvps.map((rsvp) => (
                  <TableRow key={rsvp._id} hover>
                    <TableCell>{`${rsvp.firstName} ${rsvp.lastName}`}</TableCell>
                    <TableCell>{rsvp.email}</TableCell>
                    <TableCell>{rsvp.cellNumber}</TableCell>
                    <TableCell align="center">{rsvp.guests}</TableCell>
                    <TableCell>{formatDateTime(rsvp.submittedAt)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title={rsvp.checkedInAt ? `Checked in ${formatDateTime(rsvp.checkedInAt)} — click to undo` : 'Mark as arrived'}>
                        <IconButton size="small" color={rsvp.checkedInAt ? 'success' : 'default'} onClick={() => toggleCheckIn(rsvp)}>
                          {rsvp.checkedInAt ? <CheckedInIcon fontSize="small" /> : <NotCheckedInIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Re-send confirmation email">
                        <IconButton size="small" onClick={() => resendConfirmation(rsvp)}>
                          <ResendIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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

      <RsvpEventFormDialog
        open={dialogOpen}
        event={event}
        onClose={() => setDialogOpen(false)}
        onSaved={(saved) => {
          setDialogOpen(false);
          setEvent(saved);
          setNotice('Event updated');
        }}
      />

      <Snackbar open={Boolean(notice)} autoHideDuration={3000} onClose={() => setNotice('')} message={notice} />
    </Box>
  );
};

export default RsvpEventDetail;
