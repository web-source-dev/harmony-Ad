import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Event as EventIcon,
  EventBusy as EndIcon,
  LocationOn as LocationIcon,
  OpenInNew as OpenIcon,
  PictureAsPdf as PdfIcon,
  QrCode2 as QrCodeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import API from '../../BackendAPi/ApiProvider';
import RsvpEventFormDialog from './rsvp/RsvpEventFormDialog';
import {
  RSVP_URL,
  downloadFile,
  formatEndDate,
  formatEventWhen,
  getErrorMessage,
  hasEnded,
  qrCodeUrl,
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

const StatusChip = ({ event }) => {
  if (event.isActive) return <Chip size="small" label="Live" color="success" />;
  if (hasEnded(event)) return <Chip size="small" label="Ended" />;
  return <Chip size="small" label="Inactive" variant="outlined" />;
};

const FlyerThumb = ({ event }) => {
  const flyer = event.flyer;
  return (
    <Box sx={{ height: 220, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {flyer && flyer.resourceType !== 'raw' ? (
        <Box component="img" src={flyer.url} alt={`${event.title} flyer`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : flyer ? (
        <Box textAlign="center" color="text.secondary">
          <PdfIcon sx={{ fontSize: 56, color: 'error.main' }} />
          <Typography variant="caption" display="block">
            PDF flyer
          </Typography>
        </Box>
      ) : (
        <Box textAlign="center" color="text.secondary">
          <EventIcon sx={{ fontSize: 48 }} />
          <Typography variant="caption" display="block">
            No flyer
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const RsvpEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/api/rsvp/admin/events');
      setEvents(response.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load RSVP events'));
    } finally {
      setLoading(false);
    }
  };

  // Re-reads the list quietly, e.g. after activating an event switched another one off
  const reloadEvents = async () => {
    try {
      const response = await API.get('/api/rsvp/admin/events');
      setEvents(response.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to refresh RSVP events'));
    }
  };

  const liveEvent = events.find((e) => e.isActive);

  const totals = useMemo(
    () => ({
      rsvps: events.reduce((sum, e) => sum + (e.rsvps || 0), 0),
      expectedAttendees: events.reduce((sum, e) => sum + (e.expectedAttendees || 0), 0),
      ended: events.filter((e) => !e.isActive && hasEnded(e)).length,
    }),
    [events]
  );

  const visibleEvents = events.filter((e) => {
    if (filter === 'upcoming') return !hasEnded(e);
    if (filter === 'ended') return hasEnded(e);
    return true;
  });

  const openCreate = () => {
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleSaved = async (saved, isEdit) => {
    setDialogOpen(false);
    setNotice(isEdit ? 'Event updated' : `Event created${saved.isActive ? ' and is now live on /rsvp' : ''}`);
    await reloadEvents();
  };

  const toggleActive = async (event) => {
    const turningOn = !event.isActive;
    if (turningOn && liveEvent && liveEvent._id !== event._id) {
      const ok = window.confirm(
        `Only one event can be live on /rsvp.\n\nMake "${event.title}" live? "${liveEvent.title}" will be turned off.`
      );
      if (!ok) return;
    }
    try {
      setTogglingId(event._id);
      await API.patch(`/api/rsvp/admin/events/${event._id}/active`, { isActive: turningOn });
      await reloadEvents();
      setNotice(turningOn ? `"${event.title}" is now live on /rsvp` : `"${event.title}" is turned off`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update event'));
    } finally {
      setTogglingId(null);
    }
  };

  const deleteEvent = async (event) => {
    const warning = event.rsvps
      ? `Delete "${event.title}"?\n\nThis also deletes its ${event.rsvps} RSVP(s) (${event.expectedAttendees} people) and its flyer. Contacts are kept. This can't be undone.`
      : `Delete "${event.title}" and its flyer? This can't be undone.`;
    if (!window.confirm(warning)) return;
    try {
      await API.delete(`/api/rsvp/admin/events/${event._id}`);
      setEvents((prev) => prev.filter((e) => e._id !== event._id));
      setNotice('Event deleted');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete event'));
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(RSVP_URL);
      setNotice('RSVP link copied');
    } catch {
      window.prompt('Copy the RSVP link:', RSVP_URL);
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
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
            RSVP Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            One event is live on {RSVP_URL} at a time. Each event turns off automatically after its end date.
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchEvents}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Create Event
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* The single RSVP page and what it is showing right now */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={9}>
            <Typography variant="overline" color="text.secondary">
              Live on {RSVP_URL}
            </Typography>
            {liveEvent ? (
              <>
                <Typography variant="h5" sx={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate(`/event-rsvps/${liveEvent._id}`)}>
                  {liveEvent.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {liveEvent.expectedAttendees || 0} people coming · {liveEvent.rsvps || 0} RSVPs · RSVPs close{' '}
                  {formatEndDate(liveEvent.endDate)}
                </Typography>
              </>
            ) : (
              <Typography variant="h6" color="text.secondary">
                No event is live. The RSVP page shows "No event open right now".
              </Typography>
            )}
            <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
              <Button size="small" variant="outlined" startIcon={<CopyIcon />} onClick={copyLink}>
                Copy link
              </Button>
              <Button size="small" variant="outlined" startIcon={<OpenIcon />} href={RSVP_URL} target="_blank" rel="noopener noreferrer">
                Open page
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<QrCodeIcon />}
                onClick={() => downloadFile(qrCodeUrl(RSVP_URL, 1000), 'Harmony4All_RSVP_QR.png')}
              >
                Download QR code
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={3} textAlign="center">
            <Box
              component="img"
              src={qrCodeUrl(RSVP_URL, 300)}
              alt="RSVP page QR code"
              sx={{ width: '100%', maxWidth: 160, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Same QR code for every event
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <StatCard label="Events" value={events.length} hint={`${totals.ended} ended`} />
        <StatCard label="RSVPs" value={totals.rsvps} hint="Forms submitted across all events" />
        <StatCard label="Expected Attendees" value={totals.expectedAttendees} hint="People coming across all events" />
      </Grid>

      {events.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <EventIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            No RSVP events yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Create your first event, upload its flyer, set an end date and make it live.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Create Event
          </Button>
        </Paper>
      ) : (
        <>
          <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, value) => value && setFilter(value)} sx={{ mb: 2 }}>
            <ToggleButton value="all">All ({events.length})</ToggleButton>
            <ToggleButton value="upcoming">Not ended ({events.length - events.filter(hasEnded).length})</ToggleButton>
            <ToggleButton value="ended">Ended ({events.filter(hasEnded).length})</ToggleButton>
          </ToggleButtonGroup>

          {visibleEvents.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No events here.
            </Typography>
          )}

          <Grid container spacing={3}>
            {visibleEvents.map((event) => {
              const when = formatEventWhen(event);
              const ended = hasEnded(event);
              return (
                <Grid item xs={12} sm={6} lg={4} key={event._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: ended && !event.isActive ? 0.75 : 1,
                      outline: event.isActive ? '2px solid' : 'none',
                      outlineColor: 'success.main',
                    }}
                  >
                    <CardActionArea
                      onClick={() => navigate(`/event-rsvps/${event._id}`)}
                      sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      <FlyerThumb event={event} />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1} mb={1}>
                          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {event.title}
                          </Typography>
                          <StatusChip event={event} />
                        </Box>
                        {when && (
                          <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                            <CalendarIcon fontSize="small" /> {when}
                          </Typography>
                        )}
                        {event.location && (
                          <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
                            <LocationIcon fontSize="small" /> {event.location}
                          </Typography>
                        )}
                        <Typography
                          variant="body2"
                          color={ended ? 'text.secondary' : 'text.primary'}
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                          sx={{ mt: 0.5 }}
                        >
                          <EndIcon fontSize="small" /> {ended ? 'Ended' : 'Ends'} {formatEndDate(event.endDate)}
                        </Typography>
                        <Box display="flex" gap={3} sx={{ mt: 2 }}>
                          <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                              {event.expectedAttendees || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              people coming
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                              {event.rsvps || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              RSVPs
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                    <Divider />
                    <Box display="flex" alignItems="center" justifyContent="space-between" px={1} py={0.5}>
                      <Tooltip
                        title={
                          ended && !event.isActive
                            ? 'End date has passed — edit the event to set a later end date'
                            : event.isActive
                              ? 'Turn off'
                              : 'Make this the live event on /rsvp'
                        }
                      >
                        <Box display="flex" alignItems="center">
                          <Switch
                            checked={event.isActive}
                            disabled={togglingId === event._id || (ended && !event.isActive)}
                            onChange={() => toggleActive(event)}
                            inputProps={{ 'aria-label': 'Live on RSVP page' }}
                          />
                          <Typography variant="body2">{event.isActive ? 'Live' : 'Off'}</Typography>
                        </Box>
                      </Tooltip>
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(event)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => deleteEvent(event)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      <RsvpEventFormDialog open={dialogOpen} event={editingEvent} onClose={() => setDialogOpen(false)} onSaved={handleSaved} />

      <Snackbar open={Boolean(notice)} autoHideDuration={3000} onClose={() => setNotice('')} message={notice} />
    </Box>
  );
};

export default RsvpEvents;
