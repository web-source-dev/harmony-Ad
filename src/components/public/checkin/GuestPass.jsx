import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Container, Paper, Typography } from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckedInIcon,
  Place as DirectionsIcon,
} from '@mui/icons-material';
import API from '../../../BackendAPi/ApiProvider';

// What a guest sees when they open their own check-in QR link (not logged in to the admin
// dashboard): their pass and the event details. Staff who aren't logged in yet use the small
// link at the bottom to log in and check the guest in.

const LOGO_URL = 'https://res.cloudinary.com/da5qsxtri/image/upload/v1779000604/harmony4all/assets/harmony-4-all-logo.png';

const Shell = ({ children, onStaff }) => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: { xs: 3, sm: 6 } }}>
    <Container maxWidth="xs">
      <Paper elevation={0} sx={{ border: '1px solid #e5e5e5', borderRadius: 3, overflow: 'hidden', textAlign: 'center' }}>
        <Box sx={{ pt: 4, pb: 3, borderBottom: '1px solid #eeeeee' }}>
          <Box component="img" src={LOGO_URL} alt="Harmony 4 All" sx={{ width: 110, height: 110, display: 'block', mx: 'auto' }} />
        </Box>
        <Box sx={{ px: { xs: 3, sm: 4 }, py: 5 }}>{children}</Box>
      </Paper>
      <Box textAlign="center" mt={3}>
        <Button size="small" color="inherit" onClick={onStaff} sx={{ color: 'text.disabled', textTransform: 'none' }}>
          Staff check-in
        </Button>
      </Box>
    </Container>
  </Box>
);

const GuestPass = ({ code, onStaff }) => {
  const [pass, setPass] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    API.get(`/api/rsvp/pass/${encodeURIComponent(code)}`)
      .then((res) => !cancelled && setPass(res.data))
      .catch((err) => !cancelled && setError(err?.response?.status === 404 ? 'notFound' : 'offline'));
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <Shell onStaff={onStaff}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {error === 'notFound' ? 'We couldn’t find this pass' : 'We couldn’t load your pass'}
        </Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {error === 'notFound'
            ? 'Please check the link in your RSVP confirmation email, or contact us at info@harmony4all.org.'
            : 'Please check your internet connection and try again.'}
        </Typography>
      </Shell>
    );
  }

  if (!pass) {
    return (
      <Shell onStaff={onStaff}>
        <CircularProgress />
      </Shell>
    );
  }

  const { event } = pass;
  const checkedIn = Boolean(pass.checkedInAt);

  return (
    <Shell onStaff={onStaff}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        {checkedIn ? `Welcome, ${pass.firstName}! 🎶` : `You’re all set, ${pass.firstName}! 🎶`}
      </Typography>
      <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
        {checkedIn ? 'You’re checked in. Enjoy the show!' : 'Show this QR code at the entrance and we’ll check you in.'}
      </Typography>

      <Box mt={5}>
        <Typography variant="overline" sx={{ letterSpacing: 2, color: 'text.secondary' }}>
          Your check-in pass
        </Typography>
        {checkedIn ? (
          <CheckedInIcon color="success" sx={{ display: 'block', mx: 'auto', my: 2, fontSize: 96 }} />
        ) : (
          <Box component="img" src={pass.qrUrl} alt="Check-in QR code" sx={{ display: 'block', mx: 'auto', mt: 1.5, mb: 2, width: 200, height: 200 }} />
        )}
        <Typography variant="h6" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
          {pass.firstName} {pass.lastName}
        </Typography>
        <Typography sx={{ mt: 0.5 }}>Party of {pass.guests}</Typography>
        <Typography sx={{ mt: 1.5, fontFamily: '"Courier New", monospace', letterSpacing: 2 }}>{pass.checkInCode}</Typography>
      </Box>

      <Box mt={5}>
        <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1.5 }}>{event.title}</Typography>
        {event.when && <Typography sx={{ mb: 1, lineHeight: 1.6 }}>{event.when}</Typography>}
        {event.location && (
          <Typography color="text.secondary" sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {event.location}
          </Typography>
        )}
      </Box>

      {!checkedIn && (event.googleCalendarUrl || event.directionsUrl) && (
        <Box mt={4} display="flex" justifyContent="center" gap={1.5} flexWrap="wrap">
          {event.googleCalendarUrl && (
            <Button variant="outlined" color="inherit" startIcon={<CalendarIcon />} href={event.googleCalendarUrl} target="_blank" rel="noopener" sx={{ borderRadius: 6, textTransform: 'none' }}>
              Add to calendar
            </Button>
          )}
          {event.directionsUrl && (
            <Button variant="outlined" color="inherit" startIcon={<DirectionsIcon />} href={event.directionsUrl} target="_blank" rel="noopener" sx={{ borderRadius: 6, textTransform: 'none' }}>
              Directions
            </Button>
          )}
        </Box>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 5, lineHeight: 1.7 }}>
        Questions or guest-count changes?
        <br />
        info@harmony4all.org · (737) HARMONY (427-6669)
      </Typography>
    </Shell>
  );
};

export default GuestPass;
