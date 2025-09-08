import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  VideoLibrary,
  Save,
  CloudUpload
} from '@mui/icons-material';
import MediaManagerModal from '../blog/createBlogTabs/modals/MediaManagerModal';
import API from '../../BackendAPi/ApiProvider';

const VideoManagement = () => {
  // Get current date for default value
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const currentDate = getCurrentDate();
  
  // Available time options
  const timeOptions = [
    { value: '06:00', label: '6:00 AM' },
    { value: '23:59', label: '11:59 PM' }
  ];

  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    videoUrl: '',
    scheduledDate: currentDate,
    scheduledTime: timeOptions[0].value // Default to 6:00 AM
  });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [mediaManagerOpen, setMediaManagerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setFormData(prev => ({
      ...prev,
      videoUrl: video.url
    }));
    setMediaManagerOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.caption.trim()) {
      setError('Caption is required');
      return;
    }
    
    if (!formData.videoUrl.trim()) {
      setError('Please select a video from media manager');
      return;
    }

    if (!formData.scheduledDate) {
      setError('Scheduled date is required');
      return;
    }

    if (!formData.scheduledTime) {
      setError('Scheduled time is required');
      return;
    }

    // Validate that scheduled date and time is in the future
    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    const now = new Date();
    
    if (scheduledDateTime <= now) {
      setError('Scheduled date and time must be in the future');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await API.post('/api/video', {
        title: formData.title.trim(),
        caption: formData.caption.trim(),
        videoUrl: formData.videoUrl.trim(),
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime
      });

      setSuccess('Video saved successfully!');
      
      // Reset form
      setFormData({
        title: '',
        caption: '',
        videoUrl: '',
        scheduledDate: currentDate,
        scheduledTime: timeOptions[0].value
      });
      setSelectedVideo(null);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save video');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <VideoLibrary sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Video Management
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Add new videos to the system with scheduling. Videos will be saved with pending status by default.
        </Typography>
      </Paper>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Add New Video
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={handleInputChange('title')}
              margin="normal"
              required
              placeholder="Enter video title"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Caption"
              value={formData.caption}
              onChange={handleInputChange('caption')}
              margin="normal"
              required
              multiline
              rows={4}
              placeholder="Enter video caption"
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Scheduled Date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={handleInputChange('scheduledDate')}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: currentDate
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Scheduled Time</InputLabel>
                  <Select
                    value={formData.scheduledTime}
                    onChange={handleInputChange('scheduledTime')}
                    label="Scheduled Time"
                  >
                    {timeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Select Video
              </Typography>
              
              {selectedVideo ? (
                <Paper 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'grey.50', 
                    border: '1px solid', 
                    borderColor: 'grey.300',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                  onClick={() => setMediaManagerOpen(true)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <VideoLibrary sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {selectedVideo.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {selectedVideo.type} • {Math.round(selectedVideo.size / 1024 / 1024)} MB
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    URL: {selectedVideo.url}
                  </Typography>
                  <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 1, fontWeight: 500 }}>
                    Click to change video
                  </Typography>
                </Paper>
              ) : (
                <Paper 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    border: '2px dashed', 
                    borderColor: 'grey.300',
                    backgroundColor: 'grey.50',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                  onClick={() => setMediaManagerOpen(true)}
                >
                  <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Click to select video from Media Manager
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supported formats: MP4, MOV, AVI, etc.
                  </Typography>
                </Paper>
              )}

              {/* Video Preview Section */}
              {selectedVideo && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    Video Preview
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50', border: '1px solid', borderColor: 'grey.300' }}>
                    <video
                      src={selectedVideo.url}
                      controls
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        borderRadius: '8px',
                        backgroundColor: '#000'
                      }}
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </Paper>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Saving...' : 'Save Video'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Media Manager Modal */}
      <MediaManagerModal
        open={mediaManagerOpen}
        onClose={() => setMediaManagerOpen(false)}
        onSelect={handleVideoSelect}
        mediaType="video"
        selectionMode="single"
        maxSelection={1}
      />

      {/* Success/Error Messages */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity="error" onClose={handleCloseSnackbar}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity="success" onClose={handleCloseSnackbar}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VideoManagement;
