import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Stack,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
} from '@mui/material';
import { Description, Category, LocalOffer, Add, Close, PhotoCamera } from '@mui/icons-material';
import API from '../../../BackendAPi/ApiProvider';

const BasicDetailsTab = ({
  title,
  setTitle,
  slug,
  setSlug,
  description,
  setDescription,
  category,
  setCategory,
  tags,
  setTags,
  tagInput,
  setTagInput,
  isFeatured,
  setIsFeatured,
  customCategories,
  setCustomCategories,
  allCategories,
  writer,
  setWriter,
  writers,
  setWriters,
}) => {
  const theme = useTheme();
  
  // State for new writer modal
  const [newWriterModalOpen, setNewWriterModalOpen] = useState(false);
  const [newWriterData, setNewWriterData] = useState({
    name: '',
    email: '',
    bio: '',
    image: ''
  });
  const [newWriterImageFile, setNewWriterImageFile] = useState(null);
  const [newWriterImagePreview, setNewWriterImagePreview] = useState('');
  const [newWriterError, setNewWriterError] = useState('');
  const [newWriterLoading, setNewWriterLoading] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle writer selection
  const handleWriterChange = (e) => {
    const selectedValue = e.target.value;
    
    if (selectedValue === 'new') {
      setNewWriterModalOpen(true);
    } else {
      setWriter(selectedValue);
    }
  };

  // Handle new writer creation
  const handleCreateNewWriter = async () => {
    if (!newWriterData.name.trim() || !newWriterData.email.trim()) {
      setNewWriterError('Name and email are required');
      return;
    }

    setNewWriterLoading(true);
    setNewWriterError('');

    try {
      let imageUrl = newWriterData.image; // Use URL if provided
      
      // If we have an uploaded image file, upload it first
      if (newWriterImageFile) {
        const formData = new FormData();
        formData.append('image', newWriterImageFile);
        
        const uploadResponse = await API.post('/api/writers/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        imageUrl = uploadResponse.data.url;
      }

      const writerData = {
        ...newWriterData,
        image: imageUrl
      };

      const response = await API.post('/api/writers', writerData);
      const newWriter = response.data;
      
      // Add the new writer to the writers list
      setWriters([...writers, newWriter]);
      
      // Set the new writer as selected
      setWriter(newWriter._id);
      
      // Close modal and reset form
      setNewWriterModalOpen(false);
      setNewWriterData({
        name: '',
        email: '',
        bio: '',
        image: ''
      });
      setNewWriterImageFile(null);
      setNewWriterImagePreview('');
    } catch (err) {
      setNewWriterError(err.response?.data?.message || 'Failed to create writer');
    } finally {
      setNewWriterLoading(false);
    }
  };

  // Handle image upload for new writer
  const handleWriterImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setNewWriterError('Image size should be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setNewWriterError('Please select a valid image file');
        return;
      }
      
      setNewWriterImageFile(file);
      setNewWriterImagePreview(URL.createObjectURL(file));
      setNewWriterError('');
    }
  };

  // Remove writer image
  const handleRemoveWriterImage = () => {
    setNewWriterImageFile(null);
    setNewWriterImagePreview('');
    setNewWriterData({ ...newWriterData, image: '' });
  };

  // Reset new writer form
  const handleCloseNewWriterModal = () => {
    setNewWriterModalOpen(false);
    setNewWriterData({
      name: '',
      email: '',
      bio: '',
      image: ''
    });
    setNewWriterImageFile(null);
    setNewWriterImagePreview('');
    setNewWriterError('');
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 1.5,
            fontWeight: 600,
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Description fontSize="small" />
          Blog Details
        </Typography>
        
        {/* Featured Post Switch */}
        <Box 
          sx={{ 
            mb: 3, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderRadius: '10px',
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: isFeatured ? 
              theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(33, 150, 243, 0.05)' 
              : 'transparent'
          }}
        >
          <Box>
            <Typography variant="subtitle2">Featured Post</Typography>
            <Typography variant="body2" color="text.secondary">
              Featured posts appear prominently on the homepage
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                color="primary"
              />
            }
            label=""
          />
        </Box>
        
        <TextField
          label="Blog Title"
          variant="outlined"
          fullWidth
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderWidth: '1px',
              },
            },
            '& .MuiInputLabel-outlined': {
              '&.Mui-focused': {
                color: theme.palette.primary.main,
              },
            },
          }}
        />
        
        {/* Slug field */}
        <TextField
          label="URL Slug"
          variant="outlined"
          fullWidth
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))}
          helperText="Custom URL path for the blog post (auto-generated from title if left empty)"
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
            },
          }}
        />

        <TextField
          label="Short Description"
          variant="outlined"
          fullWidth
          required
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderWidth: '1px',
              },
            },
            '& .MuiInputLabel-outlined': {
              '&.Mui-focused': {
                color: theme.palette.primary.main,
              },
            },
          }}
        />
        
        {/* Category Select */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            value={category}
            label="Category"
            onChange={(e) => setCategory(e.target.value)}
            sx={{
              borderRadius: '10px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.divider,
              },
            }}
            startAdornment={<Category sx={{ mr: 1, color: 'action.active' }} />}
          >
            {allCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
            <MenuItem value="custom">
              <em>Add Custom Category</em>
            </MenuItem>
          </Select>
        </FormControl>
        
        {/* Custom Category Input */}
        {category === 'custom' && (
          <TextField
            label="Custom Category"
            variant="outlined"
            fullWidth
            value={customCategories}
            onChange={(e) => {
              setCustomCategories(e.target.value);
              setCategory(e.target.value);
            }}
            sx={{ mb: 3, borderRadius: '10px' }}
          />
        )}
        
        {/* Writer Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="writer-label">Writer</InputLabel>
          <Select
            labelId="writer-label"
            value={writer}
            label="Writer"
            onChange={handleWriterChange}
            displayEmpty
            sx={{
              borderRadius: '10px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.divider,
              },
            }}
          >
            <MenuItem value="" disabled>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                    color: 'text.disabled',
                    flexShrink: 0
                  }}
                >
                  <span style={{ fontSize: '14px' }}>👤</span>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  Select a writer
                </Typography>
              </Box>
            </MenuItem>
            {writers.map((writerItem) => (
              <MenuItem key={writerItem._id} value={writerItem._id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.200',
                      border: '1px solid',
                      borderColor: 'divider',
                      flexShrink: 0
                    }}
                  >
                    {writerItem.image ? (
                      <img
                        src={writerItem.image}
                        alt={writerItem.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <Box
                      sx={{
                        display: writerItem.image ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'text.secondary'
                      }}
                    >
                      {writerItem.name.charAt(0).toUpperCase()}
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {writerItem.name}
                    </Typography>
                    {writerItem.email && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {writerItem.email}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </MenuItem>
            ))}
            <MenuItem value="new" sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              color: theme.palette.primary.main,
              fontWeight: 500
            }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  flexShrink: 0
                }}
              >
                <Add fontSize="small" />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Add New Writer
              </Typography>
            </MenuItem>
          </Select>
        </FormControl>
        
        {/* Tags Input */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <LocalOffer fontSize="small" />
            Tags
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <TextField
              variant="outlined"
              placeholder="Add a tag"
              size="small"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddTag}
              sx={{
                borderRadius: '10px',
                px: 2,
                py: 1,
                minWidth: '80px',
                textTransform: 'none',
              }}
            >
              Add
            </Button>
          </Box>
          
          {tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  color="primary"
                  variant="outlined"
                  sx={{ borderRadius: '8px' }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* New Writer Modal */}
      <Dialog 
        open={newWriterModalOpen} 
        onClose={handleCloseNewWriterModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6" fontWeight={600}>
            Add New Writer
          </Typography>
          <IconButton onClick={handleCloseNewWriterModal} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {newWriterError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {newWriterError}
            </Alert>
          )}
          
          <TextField
            label="Writer Name"
            variant="outlined"
            fullWidth
            required
            value={newWriterData.name}
            onChange={(e) => setNewWriterData({ ...newWriterData, name: e.target.value })}
            sx={{ mb: 3 }}
          />
          
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            required
            type="email"
            value={newWriterData.email}
            onChange={(e) => setNewWriterData({ ...newWriterData, email: e.target.value })}
            sx={{ mb: 3 }}
          />
          
          <TextField
            label="Bio (Optional)"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={newWriterData.bio}
            onChange={(e) => setNewWriterData({ ...newWriterData, bio: e.target.value })}
            sx={{ mb: 3 }}
            helperText="A short description about the writer"
          />
          
                     <Box sx={{ mb: 3 }}>
             <Typography variant="subtitle2" sx={{ mb: 1 }}>
               Profile Image
             </Typography>
             <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
               <Box
                 sx={{
                   width: 80,
                   height: 80,
                   borderRadius: '50%',
                   overflow: 'hidden',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   bgcolor: 'grey.200',
                   border: '2px dashed',
                   borderColor: 'divider',
                   flexShrink: 0,
                   position: 'relative'
                 }}
               >
                 {(newWriterImagePreview || newWriterData.image) ? (
                   <img
                     src={newWriterImagePreview || newWriterData.image}
                     alt="Writer preview"
                     style={{
                       width: '100%',
                       height: '100%',
                       objectFit: 'cover'
                     }}
                     onError={(e) => {
                       e.target.style.display = 'none';
                       e.target.nextSibling.style.display = 'flex';
                     }}
                   />
                 ) : null}
                 <Box
                   sx={{
                     display: (newWriterImagePreview || newWriterData.image) ? 'none' : 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     width: '100%',
                     height: '100%',
                     fontSize: '24px',
                     color: 'text.secondary'
                   }}
                 >
                   👤
                 </Box>
                 
                 {/* Remove image button */}
                 {(newWriterImagePreview || newWriterData.image) && (
                   <IconButton
                     onClick={handleRemoveWriterImage}
                     size="small"
                     sx={{
                       position: 'absolute',
                       top: -4,
                       right: -4,
                       bgcolor: 'error.main',
                       color: 'white',
                       width: 24,
                       height: 24,
                       '&:hover': {
                         bgcolor: 'error.dark',
                       }
                     }}
                   >
                     <Close fontSize="small" />
                   </IconButton>
                 )}
               </Box>
               
               <Box sx={{ flex: 1 }}>
                 <input
                   accept="image/*"
                   style={{ display: 'none' }}
                   id="writer-image-upload"
                   type="file"
                   onChange={handleWriterImageChange}
                 />
                 <label htmlFor="writer-image-upload">
                   <Button
                     variant="outlined"
                     component="span"
                     startIcon={<PhotoCamera />}
                     fullWidth
                     sx={{
                       borderRadius: '8px',
                       py: 1.5,
                       textTransform: 'none',
                       borderStyle: 'dashed'
                     }}
                   >
                     {newWriterImagePreview ? 'Change Image' : 'Upload Image'}
                   </Button>
                 </label>
                 
               </Box>
             </Box>
           </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleCloseNewWriterModal}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateNewWriter}
            variant="contained"
            disabled={newWriterLoading || !newWriterData.name.trim() || !newWriterData.email.trim()}
            sx={{ borderRadius: '8px' }}
          >
            {newWriterLoading ? 'Creating...' : 'Create Writer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default BasicDetailsTab; 