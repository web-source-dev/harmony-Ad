import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  useTheme,
  Checkbox,
  Paper,
  LinearProgress,
  CardActionArea
} from '@mui/material';
import {
  Close,
  Search,
  CloudUpload,
  Delete,
  Image,
  VideoLibrary,
  FilterList,
  Sort,
  Refresh,
  Check,
  Clear,
  Add,
  Folder,
  Description,
  CalendarToday,
  Storage,
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material';
import API from '../../../../BackendAPi/ApiProvider';

const MediaManagerModal = ({ 
  open, 
  onClose, 
  onSelect, 
  mediaType = 'all', // 'all', 'image', 'video'
  selectionMode = 'single', // 'single', 'multiple'
  maxSelection = 1
}) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadQueue, setUploadQueue] = useState([]);

  // Tab labels
  const tabs = [
    { label: 'All Media', value: 'all', icon: <Storage /> },
    { label: 'Images', value: 'image', icon: <Image /> },
    { label: 'Videos', value: 'video', icon: <VideoLibrary /> }
  ];

  // Load media files on component mount
  useEffect(() => {
    if (open) {
      loadMediaFiles();
    }
  }, [open]);

  // Filter and sort media when filters change
  useEffect(() => {
    filterAndSortMedia();
  }, [mediaFiles, searchTerm, filterType, sortBy, activeTab]);

  // Load all media files from the backend
  const loadMediaFiles = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await API.get('/api/media');
      const mediaData = response.data.media || [];
      setMediaFiles(mediaData);
    } catch (err) {
      setError('Failed to load media files');
      console.error('Error loading media:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort media based on current filters
  const filterAndSortMedia = () => {
    let filtered = [...mediaFiles];

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(media => 
        media.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        media.alt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        media.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(media => media.type === filterType);
    }

    // Filter by active tab
    if (activeTab === 1) { // Images tab
      filtered = filtered.filter(media => media.type === 'image');
    } else if (activeTab === 2) { // Videos tab
      filtered = filtered.filter(media => media.type === 'video');
    }

    // Sort media
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'size':
          return (b.size || 0) - (a.size || 0);
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        default:
          return 0;
      }
    });

    setFilteredMedia(filtered);
  };

  // Handle file selection for upload
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      const isValidImage = file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024; // 5MB for images
      const isValidVideo = file.type.startsWith('video/') && file.size <= 100 * 1024 * 1024; // 100MB for videos
      
      if (!isValidImage && !isValidVideo) {
        setError(`Invalid file: ${file.name}. Images must be under 5MB, videos must be under 100MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setUploadQueue(validFiles);
      uploadFiles(validFiles);
    }
  };

  // Upload files to Cloudinary
  const uploadFiles = async (files) => {
    setUploading(true);
    setUploadProgress(0);
    setError('');

    const totalFiles = files.length;
    let completedFiles = 0;

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append(file.type.startsWith('image/') ? 'image' : 'video', file);

        const endpoint = file.type.startsWith('image/') 
          ? '/api/media/upload/image' 
          : '/api/media/upload/video';

        const response = await API.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(progress);
          }
        });

        // Add the new media to the list
        const newMedia = {
          _id: response.data._id || response.data.id,
          url: response.data.url,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          size: file.size,
          createdAt: new Date().toISOString(),
          alt: response.data.alt || '',
          tags: response.data.tags || []
        };

        setMediaFiles(prev => [newMedia, ...prev]);
        completedFiles++;
        setUploadProgress((completedFiles / totalFiles) * 100);

      } catch (err) {
        console.error('Upload error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          file: file.name
        });
        setError(`Failed to upload ${file.name}: ${err.response?.data?.message || err.message}`);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    setUploadQueue([]);
    setSuccess(`Successfully uploaded ${completedFiles} file(s)`);
  };

  // Handle media selection - FIXED LOGIC
  const handleMediaSelect = (media) => {
    if (selectionMode === 'single') {
      setSelectedMedia([media]);
    } else {
      setSelectedMedia(prev => {
        // Use strict comparison and handle both string and number IDs
        const isSelected = prev.some(m => String(m._id) === String(media._id));
        
        if (isSelected) {
          return prev.filter(m => String(m._id) !== String(media._id));
        } else {
          if (prev.length >= maxSelection) {
            setError(`Maximum ${maxSelection} items can be selected`);
            return prev;
          }
          return [...prev, media];
        }
      });
    }
  };

  // Handle media deletion
  const handleDeleteMedia = async (mediaId) => {
    try {
      await API.delete(`/api/media/${mediaId}`);
      setMediaFiles(prev => prev.filter(m => m._id !== mediaId));
      setSelectedMedia(prev => prev.filter(m => m._id !== mediaId));
      setSuccess('Media deleted successfully');
    } catch (err) {
      setError('Failed to delete media');
    }
  };

  // Handle media selection confirmation
  const handleConfirmSelection = () => {
    if (selectedMedia.length === 0) {
      setError('Please select at least one media file');
      return;
    }
    
    if (selectionMode === 'single') {
      onSelect(selectedMedia[0]);
    } else {
      onSelect(selectedMedia);
    }
    onClose();
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if media is selected
  const isMediaSelected = (media) => {
    return selectedMedia.some(m => String(m._id) === String(media._id));
  };

  // Render media card - IMPROVED LAYOUT
  const renderMediaCard = (media) => {
    const selected = isMediaSelected(media);
    const mediaId = String(media._id); // Ensure ID is string
    
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={mediaId}>
        <Card 
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
            borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
            transition: 'all 0.2s ease-in-out',
            '&:hover': { 
              borderColor: theme.palette.primary.light,
              boxShadow: theme.shadows[4]
            }
          }}
        >
          {/* Selection Indicator */}
          <Box
            onClick={(e) => {
              e.stopPropagation();
              handleMediaSelect(media);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.1)'
              }
            }}
          >
            {selectionMode === 'single' ? (
              <RadioButtonUnchecked 
                color={selected ? 'primary' : 'disabled'} 
                sx={{ 
                  ...(selected && { 
                    color: theme.palette.primary.main,
                    '& .MuiSvgIcon-root': { fontSize: 28 }
                  })
                }}
              />
            ) : (
              <Checkbox
                checked={selected}
                color="primary"
                size="small"
              />
            )}
          </Box>

          <CardActionArea
            onClick={() => handleMediaSelect(media)}
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
          >
            <CardMedia
              component={media.type === 'image' ? 'img' : 'video'}
              height="160"
              image={media.type === 'image' ? media.url : undefined}
              src={media.type === 'video' ? media.url : undefined}
              alt={media.alt || media.name}
              sx={{ 
                objectFit: 'cover',
                backgroundColor: theme.palette.grey[100]
              }}
            />
            
            <CardContent sx={{ flex: 1, p: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.3
                }}
              >
                {media.name}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Chip 
                  label={media.type} 
                  size="small" 
                  color={media.type === 'image' ? 'primary' : 'secondary'}
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(media.size)}
                </Typography>
              </Box>
              
              <Typography variant="caption" color="text.secondary" display="block">
                {formatDate(media.createdAt)}
              </Typography>
            </CardContent>
          </CardActionArea>

          <CardActions sx={{ p: 1, justifyContent: 'center' }}>
            <Tooltip title="Delete media">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMedia(media._id);
                }}
                color="error"
                sx={{ 
                  backgroundColor: theme.palette.error.light,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.error.main
                  }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { 
          height: '95vh',
          maxHeight: '95vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Media Manager
        </Typography>
        <IconButton onClick={onClose} size="large">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ px: 2 }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={tab.value}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minHeight: 64 }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Upload Section - IMPROVED */}
        <Paper sx={{ m: 2, p: 3, backgroundColor: theme.palette.grey[50] }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              sx={{ minWidth: 140 }}
            >
              {uploading ? 'Uploading...' : 'Upload Media'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadMediaFiles}
              disabled={loading}
            >
              Refresh
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              {selectionMode === 'single' ? 'Single Selection' : `Multiple Selection (Max: ${maxSelection})`}
            </Typography>
          </Box>

          {/* File size limit information */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Upload Limits:</strong> Images must be under 5MB • Videos must be under 100MB
            </Typography>
          </Alert>

          {uploading && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Uploading {uploadQueue.length} file(s)... {Math.round(uploadProgress)}%
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Filters and Search - IMPROVED */}
        <Paper sx={{ mx: 2, mb: 2, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search media by name, alt text, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="image">Images</MenuItem>
                  <MenuItem value="video">Videos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="size">Size</MenuItem>
                  <MenuItem value="type">Type</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {filteredMedia.length} items found
                </Typography>
                {selectedMedia.length > 0 && (
                  <Chip 
                    label={`${selectedMedia.length} selected`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Media Grid - IMPROVED */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          px: 2, 
          pb: 2,
          minHeight: 0
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : filteredMedia.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              textAlign: 'center'
            }}>
              <Image sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No media found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Upload some media files to get started'
                }
              </Typography>
              {searchTerm && (
                <Button 
                  variant="outlined" 
                  onClick={() => setSearchTerm('')}
                  startIcon={<Clear />}
                >
                  Clear Search
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredMedia.map(renderMediaCard)}
            </Grid>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        backgroundColor: theme.palette.grey[50]
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            {selectedMedia.length} of {filteredMedia.length} items selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleConfirmSelection}
              disabled={selectedMedia.length === 0}
              startIcon={selectedMedia.length > 0 ? <Check /> : null}
            >
              {selectionMode === 'single' 
                ? 'Select Item' 
                : `Select ${selectedMedia.length} Item${selectedMedia.length !== 1 ? 's' : ''}`
              }
            </Button>
          </Box>
        </Box>
      </DialogActions>

      {/* Error and Success Messages */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default MediaManagerModal;
