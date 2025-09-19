import React, { useState, useEffect } from 'react';
import {
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
  Box,
  Fade,
  Divider,
  Avatar,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
  Skeleton,
  Switch,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import { Edit, Delete, Add, Search, Visibility, FilterList, Sort, Article } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import API from '../../BackendAPi/ApiProvider';

const ManageBlog = () => {
  const navigate = useNavigate();
  
  const theme = useTheme();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('all');

  const tabs = [
    { value: 'all', label: 'All', color: 'default' },
    { value: 'published', label: 'Published', color: 'success' },
    { value: 'scheduled', label: 'Scheduled', color: 'warning' },
    { value: 'draft', label: 'Draft', color: 'default' },
    { value: 'archived', label: 'Archived', color: 'error' }
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    let filtered = [...blogs];

    // First filter by tab
    if (currentTab !== 'all') {
      filtered = filtered.filter(blog => blog.status === currentTab);
    }

    // Then filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.description && blog.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        blog.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.writer?.name && blog.writer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (blog.writer?.email && blog.writer.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredBlogs(filtered);
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, blogs, currentTab]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/blogs/all');
      // Sort blogs by published date (newest first)
      const sortedBlogs = response.data.sort((a, b) => {
        // If both have publishedAt dates, compare them
        if (a.publishedAt && b.publishedAt) {
          return new Date(b.publishedAt) - new Date(a.publishedAt);
        }
        // If only one has publishedAt, prioritize the one with publishedAt
        if (a.publishedAt && !b.publishedAt) return -1;
        if (!a.publishedAt && b.publishedAt) return 1;
        // If neither has publishedAt, sort by createdAt
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setBlogs(sortedBlogs);
      setFilteredBlogs(sortedBlogs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (blog) => {
    setBlogToDelete(blog);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await API.delete(`/api/blogs/${blogToDelete._id}`);
      setBlogs(blogs.filter(blog => blog._id !== blogToDelete._id));
      setFilteredBlogs(filteredBlogs.filter(blog => blog._id !== blogToDelete._id));
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleStatus = async (blog) => {
    try {
      await API.put(`/api/blogs/${blog._id}/toggleStatus`, { isActive: !blog.isActive });
      fetchBlogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const getTruncatedTitle = (title) => {
    return title.length > 50 ? `${title.substring(0, 50)}...` : title;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getBlogDate = (blog) => {
    if (blog.publishedAt) {
      return { date: blog.publishedAt, label: 'Published' };
    } else if (blog.status === 'scheduled' && blog.scheduledFor) {
      return { date: blog.scheduledFor, label: 'Scheduled for' };
    } else if (blog.status === 'archived') {
      return { date: blog.createdAt, label: 'Archived' };
    } else {
      return { date: blog.createdAt, label: 'Created' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'scheduled':
        return 'warning';
      case 'draft':
        return 'default';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'published':
        return 'Published';
      case 'scheduled':
        return 'Scheduled';
      case 'draft':
        return 'Draft';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
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
          <Box 
            sx={{ 
              mb: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                }}
              >
                <Article sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    fontSize: { xs: '1.75rem', md: '2.125rem' }
                  }}
                >
                  Manage Blogs
                </Typography>
                <Typography 
                  variant="body1" 
                  color="textSecondary"
                  sx={{ mt: 0.5 }}
                >
                  Create, edit, and manage all your blog posts
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => navigate('/blog/create')}
              sx={{ 
                borderRadius: '10px',
                px: 3,
                py: 1.2,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 6px 16px ${theme.palette.primary.main}60`,
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Create New Blog
            </Button>
          </Box>
          
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
                            ? blogs.length
                            : blogs.filter(blog => blog.status === tab.value).length
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
                placeholder="Search by title, description, status, category, writer name, or email..."
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
                      Title
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
                      Writer
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
                      Date
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
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: theme.palette.text.primary,
                        py: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      Visibility
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
                          <Skeleton animation="wave" height={40} width={120} />
                        </TableCell>
                        <TableCell>
                          <Skeleton animation="wave" height={40} width={120} />
                        </TableCell>
                        <TableCell>
                          <Skeleton animation="wave" height={40} width={80} />
                        </TableCell>
                        <TableCell>
                          <Skeleton animation="wave" height={40} width={80} />
                        </TableCell>
                        <TableCell align="right">
                          <Skeleton animation="wave" height={40} width={100} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredBlogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, my: 4 }}>
                          <Avatar 
                            sx={{ 
                              width: 80, 
                              height: 80, 
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                              color: theme.palette.text.secondary
                            }}
                          >
                            <Article sx={{ fontSize: 40 }} />
                          </Avatar>
                          <Typography variant="h6" color="textSecondary">
                            No blog posts found
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 300, textAlign: 'center' }}>
                            {searchTerm ? "No matching blogs found for your search. Try different keywords." : "Start creating blog posts to share your content with the world."}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBlogs
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((blog) => (
                        <TableRow 
                          key={blog._id}
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
                            <Tooltip title={blog.title} placement="top-start" arrow>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {blog.image ? (
                                  <Avatar
                                    src={`${blog.image}`}
                                    variant="rounded"
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: '8px',
                                      border: `1px solid ${theme.palette.divider}`
                                    }}
                                  />
                                ) : (
                                  <Avatar
                                    variant="rounded"
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      bgcolor: `${theme.palette.primary.main}20`,
                                      color: theme.palette.primary.main,
                                      borderRadius: '8px'
                                    }}
                                  >
                                    <Article />
                                  </Avatar>
                                )}
                                <Box sx={{ maxWidth: 'calc(100% - 60px)' }}>
                                  <Typography
                                    noWrap
                                    fontWeight={500}
                                    sx={{ display: 'block' }}
                                  >
                                    {getTruncatedTitle(blog.title)}
                                  </Typography>
                                  {blog.description && (
                                    <Typography
                                      variant="caption"
                                      color="textSecondary"
                                      noWrap
                                      sx={{ display: 'block' }}
                                    >
                                      {blog.description.substring(0, 60)}...
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.text.primary,
                              py: 2.5,
                              borderBottom: `1px solid ${theme.palette.divider}`
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              {blog.writer?.image ? (
                                <Avatar
                                  src={blog.writer.image}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    border: `1px solid ${theme.palette.divider}`
                                  }}
                                />
                              ) : (
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: `${theme.palette.secondary.main}20`,
                                    color: theme.palette.secondary.main,
                                    fontSize: '0.875rem',
                                    fontWeight: 600
                                  }}
                                >
                                  {blog.writer?.name ? blog.writer.name.charAt(0).toUpperCase() : 'W'}
                                </Avatar>
                              )}
                              <Box>
                                <Typography
                                  variant="body2"
                                  fontWeight={500}
                                  sx={{ display: 'block', lineHeight: 1.2 }}
                                >
                                  {blog.writer?.name || 'Unknown Writer'}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                  sx={{ display: 'block', lineHeight: 1.2 }}
                                >
                                  {blog.writer?.email || 'No email'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.text.secondary,
                              py: 2.5,
                              borderBottom: `1px solid ${theme.palette.divider}`
                            }}
                          >
                            <Box>
                              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                {getBlogDate(blog).label}
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {formatDate(getBlogDate(blog).date)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Chip
                              label={getStatusLabel(blog.status)}
                              color={getStatusColor(blog.status)}
                              size="small"
                              sx={{ 
                                borderRadius: '8px', 
                                fontWeight: 500,
                                textTransform: 'capitalize',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Chip
                              label={blog.isActive ? 'Visible' : 'Hidden'}
                              color={blog.isActive ? 'success' : 'default'}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderRadius: '8px', 
                                fontWeight: 500,
                                borderColor: blog.isActive ? 'success.main' : 'grey.400',
                                color: blog.isActive ? 'success.main' : 'grey.600',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Tooltip title="View Blog">
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
                                    window.open(`https://www.harmony4all.org/blog/${blog.slug}`, '_blank');
                                  }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Blog">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: theme.palette.primary.main,
                                    bgcolor: `${theme.palette.primary.main}15`,
                                    '&:hover': {
                                      bgcolor: `${theme.palette.primary.main}25`,
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/blog/edit/${blog._id}`);
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Blog">
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
                                    handleDeleteClick(blog);
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={blog.isActive ? "Hide Blog" : "Show Blog"}>
                                <Switch
                                  checked={blog.isActive}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggleStatus(blog);
                                  }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredBlogs.length > 0 && (
              <TablePagination
                component="div"
                count={filteredBlogs.length}
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
                Are you sure you want to delete the blog post "{blogToDelete?.title}"?
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
        </Card>
      </Container>
    </Fade>
  );
};

export default ManageBlog;
