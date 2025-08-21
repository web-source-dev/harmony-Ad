import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
  Divider,
  Alert,
} from '@mui/material';
import { Close, VideoLibrary, AccessibilityNew, Storage } from '@mui/icons-material';
import MediaManagerModal from './MediaManagerModal';

const VideoModal = ({ open, onClose, onInsert, initialFile }) => {
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [altText, setAltText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [mediaManagerOpen, setMediaManagerOpen] = useState(false);
  
  const fileInputRef = useRef(null);
  
  // Handle initial file when provided (from drag and drop)
  useEffect(() => {
    if (initialFile && open) {
      setSelectedFile(initialFile);
      setPreview(URL.createObjectURL(initialFile));
      setError(''); // Clear any previous errors
      
      // Focus on the alt text field after a short delay
      setTimeout(() => {
        document.querySelector('[name="alt-text"]')?.focus();
      }, 300);
    }
  }, [initialFile, open]);
  
  const handleSubmit = () => {
    if (videoUrl) {
      onInsert({
        src: videoUrl.trim(),
        alt: altText.trim(),
        type: 'custom'
      });
      resetForm();
      onClose();
    } else {
      setError('Please select a video from the Media Manager');
    }
  };
  
  const resetForm = () => {
    setSelectedFile(null);
    setPreview('');
    setAltText('');
    setVideoUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleMediaManagerSelect = (selectedMedia) => {
    if (selectedMedia) {
      setVideoUrl(selectedMedia.url);
      setAltText(selectedMedia.alt || selectedMedia.name);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <VideoLibrary color="primary" />
          <Typography variant="h6" fontWeight={600}>Insert Video</Typography>
        </Box>
        <IconButton size="small" onClick={handleClose}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2, borderRadius: '8px' }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            Upload Video
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload, browse and select from your media files
          </Typography>
          <Button
            variant="contained"
            onClick={() => setMediaManagerOpen(true)}
          >
            Upload Video
          </Button>
        </Box>
        
        {videoUrl && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <video 
                src={videoUrl} 
                controls
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px',
                  borderRadius: '8px',
                }} 
              />
            </Box>
          </>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
          <AccessibilityNew 
            fontSize="small" 
            sx={{ mt: 2, mr: 1, color: theme.palette.primary.main }} 
          />
          <TextField
            label="Alt Text"
            name="alt-text"
            placeholder="Describe the video for accessibility and SEO"
            fullWidth
            required
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            multiline
            rows={2}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
              }
            }}
            helperText="Describe the video content for screen readers and SEO (required)"
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{ 
            borderRadius: '10px',
            textTransform: 'none',
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!videoUrl || !altText.trim()}
          sx={{ 
            borderRadius: '10px',
            textTransform: 'none',
          }}
        >
          Insert Video
        </Button>
      </DialogActions>

      {/* Media Manager Modal */}
      <MediaManagerModal
        open={mediaManagerOpen}
        onClose={() => setMediaManagerOpen(false)}
        onSelect={handleMediaManagerSelect}
        mediaType="video"
        selectionMode="single"
      />
    </Dialog>
  );
};

export default VideoModal;
