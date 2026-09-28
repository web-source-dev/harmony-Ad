import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import API from '../../../BackendAPi/ApiProvider';
import { RSVP_URL, getErrorMessage, toDateInputValue, todayInputValue } from './rsvpEventUtils';

const MAX_FLYER_BYTES = 10 * 1024 * 1024;

const emptyForm = {
  title: '',
  eventDate: '',
  endDate: '',
  eventTime: '',
  location: '',
  description: '',
  isActive: false,
};

const toForm = (event) => ({
  title: event.title || '',
  eventDate: event.eventDate ? String(event.eventDate).slice(0, 10) : '',
  endDate: toDateInputValue(event.endDate),
  eventTime: event.eventTime || '',
  location: event.location || '',
  description: event.description || '',
  isActive: Boolean(event.isActive),
});

// Create or edit an RSVP event, including its flyer (image or PDF)
const RsvpEventFormDialog = ({ open, event, onClose, onSaved }) => {
  const isEdit = Boolean(event);
  const [form, setForm] = useState(emptyForm);
  const [flyerFile, setFlyerFile] = useState(null);
  const [flyerPreview, setFlyerPreview] = useState(null);
  const [removeFlyer, setRemoveFlyer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(event ? toForm(event) : emptyForm);
    setFlyerFile(null);
    setRemoveFlyer(false);
    setError(null);
  }, [open, event, isEdit]);

  // Local preview for a newly picked image
  useEffect(() => {
    if (!flyerFile || !flyerFile.type.startsWith('image/')) {
      setFlyerPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(flyerFile);
    setFlyerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [flyerFile]);

  const setField = (field) => (e) => {
    const value = field === 'isActive' ? e.target.checked : e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Default the end date to the event date so RSVPs close after the event
      if (field === 'eventDate' && value && (!prev.endDate || prev.endDate === prev.eventDate)) next.endDate = value;
      return next;
    });
  };

  const handleFlyerPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Flyer must be an image (JPG, PNG, …) or a PDF.');
      return;
    }
    if (file.size > MAX_FLYER_BYTES) {
      setError('Flyer must be 10MB or smaller.');
      return;
    }
    setError(null);
    setFlyerFile(file);
    setRemoveFlyer(false);
  };

  const existingFlyer = isEdit && !removeFlyer && !flyerFile ? event.flyer : null;
  const showsPdf = flyerFile ? flyerFile.type === 'application/pdf' : existingFlyer?.resourceType === 'raw';
  const previewUrl = flyerPreview || (existingFlyer && existingFlyer.resourceType !== 'raw' ? existingFlyer.url : null);
  const flyerName = flyerFile?.name || existingFlyer?.fileName || 'Flyer';
  const hasFlyer = Boolean(flyerFile || existingFlyer);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Event title is required.');
      return;
    }
    if (!form.endDate) {
      setError('End date is required. The event turns off automatically after this date.');
      return;
    }
    if (form.isActive && form.endDate < todayInputValue()) {
      setError('The end date has already passed. Pick a later end date to make this event active.');
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, String(value)));
    if (flyerFile) data.append('flyer', flyerFile);
    if (removeFlyer) data.append('removeFlyer', 'true');

    try {
      setSaving(true);
      setError(null);
      const response = isEdit
        ? await API.put(`/api/rsvp/admin/events/${event._id}`, data)
        : await API.post('/api/rsvp/admin/events', data);
      onSaved(response.data, isEdit);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save event. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit RSVP Event' : 'Create RSVP Event'}</DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField label="Event title" value={form.title} onChange={setField('title')} required fullWidth autoFocus />
                <Box display="flex" gap={2}>
                  <TextField
                    label="Event date"
                    type="date"
                    value={form.eventDate}
                    onChange={setField('eventDate')}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="Time"
                    placeholder="6:00 PM – 9:00 PM"
                    value={form.eventTime}
                    onChange={setField('eventTime')}
                    fullWidth
                  />
                </Box>
                <TextField label="Location" value={form.location} onChange={setField('location')} fullWidth />
                <TextField
                  label="End date"
                  type="date"
                  value={form.endDate}
                  onChange={setField('endDate')}
                  InputLabelProps={{ shrink: true }}
                  helperText="RSVPs close at the end of this day (New York time) and the event turns off automatically."
                  required
                  fullWidth
                />
                <TextField
                  label="Description"
                  value={form.description}
                  onChange={setField('description')}
                  multiline
                  minRows={3}
                  fullWidth
                />
                <FormControlLabel
                  control={<Switch checked={form.isActive} onChange={setField('isActive')} />}
                  label={
                    form.isActive
                      ? `Active — this event is shown on ${RSVP_URL} (any other active event is turned off)`
                      : 'Inactive — not shown on the website'
                  }
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Flyer
              </Typography>
              <Box
                sx={{
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  minHeight: 260,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  bgcolor: 'action.hover',
                  mb: 1.5,
                }}
              >
                {previewUrl ? (
                  <Box component="img" src={previewUrl} alt="Flyer preview" sx={{ width: '100%', maxHeight: 360, objectFit: 'contain' }} />
                ) : hasFlyer && showsPdf ? (
                  <Box textAlign="center" p={2}>
                    <PdfIcon sx={{ fontSize: 56, color: 'error.main' }} />
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {flyerName}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" p={2}>
                    No flyer yet. It is shown on the RSVP page and emailed to everyone who RSVPs.
                  </Typography>
                )}
              </Box>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button component="label" variant="outlined" startIcon={<UploadIcon />}>
                  {hasFlyer ? 'Replace flyer' : 'Upload flyer'}
                  <input hidden type="file" accept="image/*,application/pdf" onChange={handleFlyerPick} />
                </Button>
                {hasFlyer && (
                  <Button
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      if (flyerFile) setFlyerFile(null);
                      else setRemoveFlyer(true);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Image or PDF, up to 10MB.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={18} /> : null}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RsvpEventFormDialog;
