import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TablePagination,
  Chip,
  useTheme,
  Fade,
  Avatar,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
  Skeleton,
  Tabs,
  Tab,
  Badge,
  CardMedia,
  CardContent,
  Grid
} from '@mui/material';
import { 
  Delete, 
  Search, 
  Visibility, 
  VideoLibrary,
  Schedule,
  CheckCircle,
  Pending,
  CalendarToday,
  AccessTime,
  Refresh,
  ArrowBack,
  Add
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import API from '../../BackendAPi/ApiProvider';

const ManageVideos = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);

  const tabs = [
    { value: 'all', label: 'All Videos', color: 'default' },
    { value: 'pending', label: 'Scheduled', color: 'warning' },
    { value: 'approved', label: 'Published', color: 'success' },
  ];

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    let filtered = [...videos];

    // Filter by tab
    if (currentTab !== 'all') {
      filtered = filtered.filter(video => video.status === currentTab);
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVideos(filtered);
    setPage(0);
  }, [searchTerm, videos, currentTab]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/video/all');
      const sortedVideos = response.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setVideos(sortedVideos);
      setFilteredVideos(sortedVideos);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (video) => {
    setVideoToDelete(video);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await API.delete(`/api/video/${videoToDelete._id}`);
      setVideos(videos.filter(video => video._id !== videoToDelete._id));
      setFilteredVideos(filteredVideos.filter(video => video._id !== videoToDelete._id));
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete video');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePreviewVideo = (video) => {
    setPreviewVideo(video);
    setVideoPreviewOpen(true);
  };

  const getTruncatedText = (text, maxLength = 50) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    // Convert 24-hour format to 12-hour with AM/PM
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Published';
      case 'pending':
        return 'Scheduled';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle fontSize="small" />;
      case 'pending':
        return <Pending fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="xl" sx={{ py: 0 }}>
        <Card 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: '16px',
            background: theme.palette.background.paper,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
          }}
        >
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '8px',
                '& .MuiAlert-icon': {
                  alignItems: 'center'
                }
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Video Statistics */}
          {!loading && (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 193, 7, 0.08)' : 'rgba(255, 193, 7, 0.05)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Schedule sx={{ color: theme.palette.warning.main }} />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Scheduled Videos
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: theme.palette.warning.main }}>
                      {videos.filter(v => v.status === 'pending').length}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(76, 175, 80, 0.05)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircle sx={{ color: theme.palette.success.main }} />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Published Videos
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: theme.palette.success.main }}>
                      {videos.filter(v => v.status === 'approved').length}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.08)' : 'rgba(33, 150, 243, 0.05)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <VideoLibrary sx={{ color: theme.palette.info.main }} />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Total Videos
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: theme.palette.info.main }}>
                      {videos.length}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
          
          <Box sx={{ mb: 3 }}>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={currentTab}
                onChange={(e, newValue) => setCurrentTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 48,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                  }
                }}
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.value}
                    value={tab.value}
                    label={
                      <Badge
                        badgeContent={
                          tab.value === 'all'
                            ? videos.length
                            : videos.filter(video => video.status === tab.value).length
                        }
                        color={tab.color}
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.75rem',
                            height: '20px',
                            minWidth: '20px',
                          }
                        }}
                      >
                        <Box sx={{ pr: 1 }}>{tab.label}</Box>
                      </Badge>
                    }
                  />
                ))}
              </Tabs>
            </Box>

            {/* Search Field */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              <TextField
                placeholder="Search by title, caption, or status..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '10px' }
                }}
                sx={{ 
                  width: { xs: '100%', sm: '320px' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />
            </Box>
          </Box>
        
          <Paper
            elevation={0}
            sx={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: theme.palette.text.primary,
                        py: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      Video
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: theme.palette.text.primary,
                        py: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      Caption
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: theme.palette.text.primary,
                        py: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      Scheduled For
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: theme.palette.text.primary,
                        py: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: theme.palette.text.primary,
                        py: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from(new Array(5)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton animation="wave" height={40} width="80%" />
                        </TableCell>
                        <TableCell>
                          <Skeleton animation="wave" height={40} width="80%" />
                        </TableCell>
                        <TableCell>
                          <Skeleton animation="wave" height={40} width={120} />
                        </TableCell>
                        <TableCell>
                          <Skeleton animation="wave" height={40} width={80} />
                        </TableCell>
                        <TableCell align="right">
                          <Skeleton animation="wave" height={40} width={100} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredVideos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, my: 4 }}>
                          <Avatar 
                            sx={{ 
                              width: 80, 
                              height: 80, 
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                              color: theme.palette.text.secondary
                            }}
                          >
                            <VideoLibrary sx={{ fontSize: 40 }} />
                          </Avatar>
                          <Typography variant="h6" color="textSecondary">
                            No videos found
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 300, textAlign: 'center' }}>
                            {searchTerm ? "No matching videos found for your search. Try different keywords." : "Start scheduling videos to share your content."}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVideos
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((video) => (
                        <TableRow 
                          key={video._id}
                          sx={{
                            '&:hover': {
                              backgroundColor: theme.palette.action.hover
                            },
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <TableCell
                            sx={{
                              color: theme.palette.text.primary,
                              fontWeight: 500,
                              py: 2.5,
                              borderBottom: `1px solid ${theme.palette.divider}`
                            }}
                          >
                            <Tooltip title={video.title} placement="top-start" arrow>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  variant="rounded"
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    bgcolor: `${theme.palette.secondary.main}20`,
                                    color: theme.palette.secondary.main,
                                    borderRadius: '8px'
                                  }}
                                >
                                  <VideoLibrary />
                                </Avatar>
                                <Box sx={{ maxWidth: 'calc(100% - 60px)' }}>
                                  <Typography
                                    noWrap
                                    fontWeight={500}
                                    sx={{ display: 'block' }}
                                  >
                                    {getTruncatedText(video.title)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.text.secondary,
                              py: 2.5,
                              borderBottom: `1px solid ${theme.palette.divider}`,
                              maxWidth: '300px'
                            }}
                          >
                            <Typography variant="body2" noWrap>
                              {getTruncatedText(video.caption, 60)}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.text.secondary,
                              py: 2.5,
                              borderBottom: `1px solid ${theme.palette.divider}`
                            }}
                          >
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <CalendarToday fontSize="small" sx={{ fontSize: '0.875rem' }} />
                                <Typography variant="body2" fontWeight={500}>
                                  {formatDate(video.scheduledDate)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTime fontSize="small" sx={{ fontSize: '0.875rem' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {formatTime(video.scheduledTime)} NY
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Chip
                              label={getStatusLabel(video.status)}
                              color={getStatusColor(video.status)}
                              size="small"
                              icon={getStatusIcon(video.status)}
                              sx={{ 
                                borderRadius: '8px', 
                                fontWeight: 500,
                                textTransform: 'capitalize',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Tooltip title="Preview Video">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: theme.palette.info.main,
                                    bgcolor: `${theme.palette.info.main}15`,
                                    '&:hover': {
                                      bgcolor: `${theme.palette.info.main}25`,
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreviewVideo(video);
                                  }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Video">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: theme.palette.error.main,
                                    bgcolor: `${theme.palette.error.main}15`,
                                    '&:hover': {
                                      bgcolor: `${theme.palette.error.main}25`,
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(video);
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredVideos.length > 0 && (
              <TablePagination
                component="div"
                count={filteredVideos.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  borderTop: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                }}
              />
            )}
          </Paper>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: '12px',
                width: '100%',
                maxWidth: '400px',
              }
            }}
          >
            <DialogTitle sx={{ 
              pb: 1,
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}>
              Confirm Delete
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                Are you sure you want to delete the video "{videoToDelete?.title}"?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
              <Button 
                onClick={() => setDeleteDialogOpen(false)}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm} 
                color="error"
                variant="contained"
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: theme.shadows[2],
                  }
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Video Preview Dialog */}
          <Dialog
            open={videoPreviewOpen}
            onClose={() => setVideoPreviewOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '16px',
              }
            }}
          >
            <DialogTitle sx={{ 
              pb: 2,
              fontWeight: 600,
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VideoLibrary color="secondary" />
                Video Preview
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              {previewVideo && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {previewVideo.title}
                  </Typography>
                  
                  <Card sx={{ mb: 2 }}>
                    <CardMedia
                      component="video"
                      controls
                      src={previewVideo.videoUrl}
                      sx={{
                        width: '100%',
                        maxHeight: '400px',
                        backgroundColor: '#000'
                      }}
                    />
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Caption:
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {previewVideo.caption}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(previewVideo.scheduledDate)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTime fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatTime(previewVideo.scheduledTime)} NY Time
                          </Typography>
                        </Box>
                        <Chip
                          label={getStatusLabel(previewVideo.status)}
                          color={getStatusColor(previewVideo.status)}
                          size="small"
                          icon={getStatusIcon(previewVideo.status)}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
              <Button 
                onClick={() => setVideoPreviewOpen(false)}
                variant="contained"
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Card>
      </Container>
    </Fade>
  );
};

export default ManageVideos;