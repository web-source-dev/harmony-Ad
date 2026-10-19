import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckedInIcon,
  Clear as ClearIcon,
  Dashboard as DashboardIcon,
  HowToReg as CheckInIcon,
  QrCodeScanner as ScanIcon,
  Search as SearchIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import API from '../../../BackendAPi/ApiProvider';
import QrScannerDialog from './QrScannerDialog';
import GuestPass from './GuestPass';
import { useAuth } from '../../../contexts/AuthContext';

// Door check-in at the event, for anyone logged in to the admin dashboard: find a guest by scanning
// their QR or typing their name, email, phone or code, then check them in. Opening a guest's QR link
// with the camera app lands here too: logged in, it goes straight to that guest; otherwise the guest
// sees their own pass, with a link for staff to log in.

const EVENT_KEY = 'h4aCheckInEvent';
const STATS_REFRESH_MS = 20000;

const storage = {
  get: (key) => {
    try {
      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  },
  set: (key, value) => {
    try {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    } catch {
      // Private browsing: the event choice just isn't remembered
    }
  },
};

const formatTime = (date) =>
  date ? new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';

const partyLabel = (guests) => (guests === 1 ? '1 guest' : `${guests} guests`);

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback;

// ─── Guest card ──────────────────────────────────────────────────────────────

const GuestCard = ({ guest, otherEventTitle, saving, onCheckIn, onUndo, onNext }) => {
  const checkedIn = Boolean(guest.checkedInAt);
  return (
    <Paper sx={{ p: { xs: 2.5, sm: 4 }, textAlign: 'center' }}>
      {otherEventTitle && (
        <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>
          This RSVP is for <strong>{otherEventTitle}</strong>, not the event selected above.
        </Alert>
      )}
      <Box
        sx={{
          py: 3,
          px: 2,
          borderRadius: 3,
          bgcolor: checkedIn ? 'success.main' : 'action.hover',
          color: checkedIn ? 'success.contrastText' : 'text.primary',
          transition: 'background-color 200ms',
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: 32, sm: 44 }, wordBreak: 'break-word' }}>
          {guest.firstName} {guest.lastName}
        </Typography>
        <Typography variant="h5" sx={{ mt: 1 }}>
          Party of {guest.guests}
        </Typography>
        {checkedIn && (
          <Typography sx={{ mt: 1.5, fontSize: 18 }} display="flex" alignItems="center" justifyContent="center" gap={1}>
            <CheckedInIcon /> Checked in at {formatTime(guest.checkedInAt)}
          </Typography>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        {[guest.emailHint, guest.phoneLast4 && `phone ••${guest.phoneLast4}`, guest.checkInCode].filter(Boolean).join('  ·  ')}
      </Typography>

      <Box mt={3} display="flex" flexDirection="column" alignItems="center" gap={1.5}>
        {checkedIn ? (
          <>
            <Button size="large" variant="contained" onClick={onNext} sx={{ px: 6, py: 1.5, fontSize: 18 }}>
              Next guest
            </Button>
            <Button startIcon={<UndoIcon />} color="inherit" disabled={saving} onClick={onUndo}>
              Undo check-in
            </Button>
          </>
        ) : (
          <>
            <Button
              size="large"
              variant="contained"
              color="success"
              startIcon={saving ? <CircularProgress size={22} color="inherit" /> : <CheckInIcon />}
              disabled={saving}
              onClick={onCheckIn}
              sx={{ px: 6, py: 2, fontSize: 20 }}
            >
              Check in {partyLabel(guest.guests)}
            </Button>
            <Button color="inherit" onClick={onNext}>
              Cancel
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

const VolunteerCheckIn = () => {
  const { code: codeParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const { isAuthenticated, logout } = useAuth();

  const [events, setEvents] = useState(null);
  const [eventId, setEventId] = useState(() => storage.get(EVENT_KEY));
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [guest, setGuest] = useState(null);
  const [guestEventTitle, setGuestEventTitle] = useState('');
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Every call carries the admin login (ApiProvider adds it); a 401 means it expired or the password
  // changed, so log out and the page sends the user to the login screen
  const call = useCallback(
    async (config) => {
      try {
        return (await API.request(config)).data;
      } catch (err) {
        if (err?.response?.status === 401) logout();
        throw err;
      }
    },
    [logout]
  );

  const focusSearch = () => setTimeout(() => searchRef.current?.focus(), 50);

  // Events to choose from; keeps the tablet's last choice, otherwise the soonest event
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadError(null);
    call({ method: 'get', url: '/api/check-in/events' })
      .then((list) => {
        setEvents(list);
        setEventId((current) => (list.some((event) => event._id === current) ? current : list[0]?._id || ''));
      })
      .catch((err) => setLoadError(errorMessage(err, 'Could not load events. Check the internet connection and refresh.')));
  }, [isAuthenticated, call]);

  useEffect(() => storage.set(EVENT_KEY, eventId), [eventId]);

  const refreshStats = useCallback(() => {
    if (!eventId) return;
    call({ method: 'get', url: `/api/check-in/events/${eventId}/stats` })
      .then(setStats)
      .catch(() => {});
  }, [eventId, call]);

  // Totals stay current while several tablets check people in
  useEffect(() => {
    if (!isAuthenticated || !eventId) return undefined;
    setStats(null);
    refreshStats();
    const timer = setInterval(refreshStats, STATS_REFRESH_MS);
    return () => clearInterval(timer);
  }, [isAuthenticated, eventId, refreshStats]);

  // Suggestions as the volunteer types
  useEffect(() => {
    const q = query.trim();
    if (!q || !eventId) {
      setSuggestions([]);
      setSearching(false);
      return undefined;
    }
    setSearching(true);
    let cancelled = false;
    const timer = setTimeout(() => {
      call({ method: 'get', url: `/api/check-in/events/${eventId}/search`, params: { q } })
        .then((results) => {
          if (cancelled) return;
          setSuggestions(results);
          setHighlighted(0);
        })
        .catch(() => !cancelled && setSuggestions([]))
        .finally(() => !cancelled && setSearching(false));
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, eventId, call]);

  const showGuest = (found, eventTitle = '') => {
    setGuest(found);
    setGuestEventTitle(found.event && found.event !== eventId ? eventTitle || 'another event' : '');
    setQuery('');
    setSuggestions([]);
  };

  const lookUpCode = useCallback(
    async (code) => {
      setNotice(null);
      try {
        const found = await call({ method: 'get', url: `/api/check-in/code/${encodeURIComponent(code)}` });
        setGuest(found);
        setGuestEventTitle(found.event !== eventId ? found.eventTitle || 'another event' : '');
        setQuery('');
      } catch (err) {
        setGuest(null);
        setNotice({ severity: 'error', text: errorMessage(err, 'Could not look up this code') });
      }
    },
    [call, eventId]
  );

  // A guest's QR opened with the camera app lands on /check-in/<code>
  useEffect(() => {
    if (isAuthenticated && events && codeParam) lookUpCode(codeParam);
  }, [isAuthenticated, events, codeParam, lookUpCode]);

  const nextGuest = () => {
    setGuest(null);
    setNotice(null);
    setQuery('');
    if (codeParam) navigate('/check-in', { replace: true });
    focusSearch();
  };

  const setCheckedIn = async (checkedIn) => {
    if (!checkedIn && !window.confirm(`Undo check-in for ${guest.firstName} ${guest.lastName}?`)) return;
    setSaving(true);
    setNotice(null);
    try {
      const updated = await call({ method: 'patch', url: `/api/check-in/rsvps/${guest._id}`, data: { checkedIn } });
      setGuest(updated);
      if (checkedIn) {
        setNotice({ severity: 'success', text: `Welcome, ${updated.firstName}! ${partyLabel(updated.guests)} checked in.` });
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        setGuest(err.response.data.guest);
        setNotice({
          severity: 'warning',
          text: `Already checked in at ${formatTime(err.response.data.guest.checkedInAt)} (maybe by another volunteer).`,
        });
      } else {
        setNotice({ severity: 'error', text: errorMessage(err, 'Check-in failed. Please try again.') });
      }
    } finally {
      setSaving(false);
      refreshStats();
    }
  };

  const onSearchKeyDown = (e) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      showGuest(suggestions[highlighted]);
    }
  };

  const onScanned = useCallback(
    (code) => {
      setScannerOpen(false);
      lookUpCode(code);
    },
    [lookUpCode]
  );

  // Not logged in: a guest who opened their own QR link sees their pass; anything else goes to login
  if (!isAuthenticated) {
    if (codeParam) return <GuestPass code={codeParam} onStaff={() => navigate('/admin/login', { state: { from: location } })} />;
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const event = events?.find((item) => item._id === eventId);
  const progress = stats?.expectedGuests ? Math.round((stats.checkedInGuests / stats.expectedGuests) * 100) : 0;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Header: event, totals, back to the dashboard */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Box flex={1} minWidth={0}>
            <Typography variant="overline" color="text.secondary">
              Harmony 4 All · Door check-in
            </Typography>
            {events && events.length > 1 ? (
              <TextField
                select
                fullWidth
                size="small"
                value={eventId}
                onChange={(e) => {
                  setEventId(e.target.value);
                  setGuest(null);
                  setNotice(null);
                }}
                sx={{ mt: 0.5 }}
              >
                {events.map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.title}
                    {item.when ? ` — ${item.when}` : ''}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <>
                <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
                  {event?.title || (events ? 'No upcoming events' : 'Loading…')}
                </Typography>
                {event?.when && (
                  <Typography variant="body2" color="text.secondary">
                    {event.when}
                  </Typography>
                )}
              </>
            )}
          </Box>
          <Button component={RouterLink} to="/" startIcon={<DashboardIcon />} color="inherit" sx={{ whiteSpace: 'nowrap' }}>
            Dashboard
          </Button>
        </Box>

        {stats && (
          <Box mt={2}>
            <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <Typography sx={{ fontWeight: 600 }}>
                {stats.checkedInGuests} of {stats.expectedGuests} guests arrived
              </Typography>
              <Typography color="text.secondary">
                {stats.checkedInRsvps} of {stats.rsvps} RSVPs checked in
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={Math.min(progress, 100)} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
          </Box>
        )}
      </Paper>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      {events && !events.length && (
        <Alert severity="info">There are no upcoming events to check guests in for.</Alert>
      )}

      {event && (
        <>
          {/* Search + scan */}
          <Box display="flex" gap={1.5} mb={2}>
            <TextField
              inputRef={searchRef}
              autoFocus
              fullWidth
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value) {
                  setGuest(null);
                  setNotice(null);
                }
              }}
              onKeyDown={onSearchKeyDown}
              placeholder="Name, email, phone or code"
              inputProps={{ autoComplete: 'off', autoCorrect: 'off', autoCapitalize: 'none', spellCheck: false, style: { fontSize: 20 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: query && (
                  <InputAdornment position="end">
                    {searching ? (
                      <CircularProgress size={20} />
                    ) : (
                      <IconButton aria-label="Clear search" onClick={() => { setQuery(''); focusSearch(); }}>
                        <ClearIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="contained" startIcon={<ScanIcon />} onClick={() => setScannerOpen(true)} sx={{ px: 3, whiteSpace: 'nowrap' }}>
              Scan QR
            </Button>
          </Box>

          {/* Suggestions */}
          {query.trim() && (
            <Paper sx={{ mb: 2, overflow: 'hidden' }}>
              {suggestions.length ? (
                <List disablePadding>
                  {suggestions.map((item, index) => (
                    <ListItemButton
                      key={item._id}
                      selected={index === highlighted}
                      onClick={() => showGuest(item)}
                      divider={index < suggestions.length - 1}
                      sx={{ py: 1.5 }}
                    >
                      <ListItemText
                        primary={`${item.firstName} ${item.lastName}`}
                        primaryTypographyProps={{ fontSize: 20, fontWeight: 600 }}
                        secondary={[partyLabel(item.guests), item.emailHint, item.phoneLast4 && `••${item.phoneLast4}`]
                          .filter(Boolean)
                          .join('  ·  ')}
                      />
                      {item.checkedInAt ? (
                        <Chip color="success" icon={<CheckedInIcon />} label={`In ${formatTime(item.checkedInAt)}`} />
                      ) : (
                        <Chip variant="outlined" label="Not checked in" />
                      )}
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                !searching && (
                  <Typography color="text.secondary" sx={{ p: 2.5 }}>
                    No RSVP matches “{query.trim()}”. Try the last name, email or the last 4 digits of their phone.
                  </Typography>
                )
              )}
            </Paper>
          )}
        </>
      )}

      {notice && (
        <Alert severity={notice.severity} sx={{ mb: 2, fontSize: 17 }} onClose={() => setNotice(null)}>
          {notice.text}
        </Alert>
      )}

      {guest && (
        <GuestCard
          guest={guest}
          otherEventTitle={guestEventTitle}
          saving={saving}
          onCheckIn={() => setCheckedIn(true)}
          onUndo={() => setCheckedIn(false)}
          onNext={nextGuest}
        />
      )}

      {event && !guest && !query.trim() && !notice && (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Scan the guest’s QR code, or start typing their name.
        </Typography>
      )}

      <QrScannerDialog open={scannerOpen} onClose={() => setScannerOpen(false)} onCode={onScanned} />
    </Container>
  );
};

export default VolunteerCheckIn;
