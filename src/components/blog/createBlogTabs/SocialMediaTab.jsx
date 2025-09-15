import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Paper,
  IconButton,
  Divider,
  useTheme,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { Facebook, Twitter, PhotoCamera, Close, Share, Link, Preview, Storage } from '@mui/icons-material';
import MediaManagerModal from './modals/MediaManagerModal';

const SocialMediaTab = ({
  title,
  description,
  image,
  preview,
  ogTitle,
  setOgTitle,
  ogDescription,
  setOgDescription,
  ogImage,
  setOgImage,
  ogImagePreview,
  setOgImagePreview,
  twitterTitle,
  setTwitterTitle,
  twitterDescription,
  setTwitterDescription,
  twitterImage,
  setTwitterImage,
  twitterImagePreview,
  setTwitterImagePreview,
}) => {
  const theme = useTheme();
  
  // State for media manager modals
  const [ogMediaManagerOpen, setOgMediaManagerOpen] = React.useState(false);
  const [twitterMediaManagerOpen, setTwitterMediaManagerOpen] = React.useState(false);

  const handleOgImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setOgImage(file);
      setOgImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTwitterImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setTwitterImage(file);
      setTwitterImagePreview(URL.createObjectURL(file));
    }
  };

  const removeOgImage = () => {
    setOgImage(null);
    setOgImagePreview('');
  };

  const removeTwitterImage = () => {
    setTwitterImage(null);
    setTwitterImagePreview('');
  };

  // Handle media manager selection for OG image
  const handleOgMediaManagerSelect = (selectedMedia) => {
    if (selectedMedia) {
      // Store the URL as a string in the ogImage state for media manager selections
      setOgImage(selectedMedia.url);
      setOgImagePreview(selectedMedia.url);
    }
  };

  // Handle media manager selection for Twitter image
  const handleTwitterMediaManagerSelect = (selectedMedia) => {
    if (selectedMedia) {
      // Store the URL as a string in the twitterImage state for media manager selections
      setTwitterImage(selectedMedia.url);
      setTwitterImagePreview(selectedMedia.url);
    }
  };

  // Use blog values for previews if social media fields are not set
  const displayOgTitle = ogTitle || title;
  const displayOgDescription = ogDescription || description;
  const displayOgImage = ogImagePreview || preview;

  const displayTwitterTitle = twitterTitle || title;
  const displayTwitterDescription = twitterDescription || description;
  const displayTwitterImage = twitterImagePreview || preview;

  // Helper function to format image URLs correctly
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    
    // If it's a blob URL (from local file selection) or already has http/https, use as is
    if (imageUrl.startsWith('blob:') || imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Otherwise, it's a relative path from the backend that needs the API URL
    return `${process.env.REACT_APP_API_URL}${imageUrl}`;
  };

  return (
    <Box>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          mb: 1,
          fontWeight: 600,
          color: theme.palette.text.primary,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Share fontSize="small" />
        Social Media Sharing
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Customize how your post appears when shared on social media platforms.
        If left empty, the blog title, description and featured image will be used.
      </Typography>

      <Grid container spacing={4}>
        {/* Facebook/Open Graph Settings */}
        <Grid item xs={12} md={6}>
          <Box 
            sx={{ 
              p: 3,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(66, 103, 178, 0.08)' 
                : 'rgba(66, 103, 178, 0.05)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Facebook sx={{ color: '#4267B2', mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Facebook & Open Graph
              </Typography>
            </Box>

            <TextField
              label="OG Title"
              placeholder={title || "Enter title for Facebook sharing"}
              variant="outlined"
              fullWidth
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color={ogTitle?.length > 90 ? "error" : "text.secondary"}>
                      {ogTitle?.length || 0}/90
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="OG Description"
              placeholder={description || "Enter description for Facebook sharing"}
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color={ogDescription?.length > 200 ? "error" : "text.secondary"}>
                      {ogDescription?.length || 0}/200
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>OG Image</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Storage />}
                onClick={() => setOgMediaManagerOpen(true)}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: '#4267B2',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#365899',
                  }
                }}
              >
                {ogImagePreview ? 'Change Image' : 'Upload Image'}
              </Button>
              
              <Typography variant="caption" color="text.secondary">
                Recommended size: 1200 x 630 pixels
              </Typography>
            </Box>

            {ogImagePreview && (
              <Box sx={{ position: 'relative', width: 'fit-content', mb: 3 }}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 1,
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={getImageUrl(ogImagePreview)}
                    alt="Facebook/Open Graph preview image"
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto',
                      maxHeight: '150px',
                      borderRadius: '4px',
                      display: 'block',
                    }}
                  />
                </Paper>
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    backgroundColor: theme.palette.error.main,
                    color: '#fff',
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      backgroundColor: theme.palette.error.dark,
                    },
                    border: `2px solid ${theme.palette.background.paper}`,
                    padding: '4px',
                  }}
                  size="small"
                  onClick={removeOgImage}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Facebook Sharing Preview */}
            <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Preview fontSize="small" />
              Facebook Sharing Preview
            </Typography>

            <Card sx={{ mb: 2, maxWidth: 500, boxShadow: theme.shadows[2] }}>
              {displayOgImage && (
                <CardMedia
                  component="img"
                  height="261"
                  image={getImageUrl(displayOgImage)}
                  alt="Facebook sharing preview"
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ pt: 1, pb: '16px !important' }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  example.com
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, lineHeight: 1.3, my: 0.5 }}>
                  {displayOgTitle || "Your post title will appear here"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {displayOgDescription || "Your post description will appear here. This text may be truncated if it's too long for the preview card."}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Twitter Settings */}
        <Grid item xs={12} md={6}>
          <Box 
            sx={{ 
              p: 3,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(29, 161, 242, 0.08)' 
                : 'rgba(29, 161, 242, 0.05)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Twitter sx={{ color: '#1DA1F2', mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Twitter Card
              </Typography>
            </Box>

            <TextField
              label="Twitter Title"
              placeholder={title || "Enter title for Twitter sharing"}
              variant="outlined"
              fullWidth
              value={twitterTitle}
              onChange={(e) => setTwitterTitle(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color={twitterTitle?.length > 70 ? "error" : "text.secondary"}>
                      {twitterTitle?.length || 0}/70
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Twitter Description"
              placeholder={description || "Enter description for Twitter sharing"}
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              value={twitterDescription}
              onChange={(e) => setTwitterDescription(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color={twitterDescription?.length > 200 ? "error" : "text.secondary"}>
                      {twitterDescription?.length || 0}/200
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>Twitter Image</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Storage />}
                onClick={() => setTwitterMediaManagerOpen(true)}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: '#1DA1F2',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#1a8cd8',
                  }
                }}
              >
                {twitterImagePreview ? 'Change Image' : 'Upload Image'}
              </Button>
              
              <Typography variant="caption" color="text.secondary">
                Recommended size: 1200 x 675 pixels
              </Typography>
            </Box>

            {twitterImagePreview && (
              <Box sx={{ position: 'relative', width: 'fit-content', mb: 3 }}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 1,
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={getImageUrl(twitterImagePreview)}
                    alt="Twitter Card preview image"
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto',
                      maxHeight: '150px',
                      borderRadius: '4px',
                      display: 'block',
                    }}
                  />
                </Paper>
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    backgroundColor: theme.palette.error.main,
                    color: '#fff',
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      backgroundColor: theme.palette.error.dark,
                    },
                    border: `2px solid ${theme.palette.background.paper}`,
                    padding: '4px',
                  }}
                  size="small"
                  onClick={removeTwitterImage}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Twitter Sharing Preview */}
            <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Preview fontSize="small" />
              Twitter Sharing Preview
            </Typography>

            <Card sx={{ mb: 2, maxWidth: 500, boxShadow: theme.shadows[2], borderRadius: '16px', overflow: 'hidden' }}>
              {displayTwitterImage && (
                <CardMedia
                  component="img"
                  height="261"
                  image={getImageUrl(displayTwitterImage)}
                  alt="Twitter sharing preview"
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ pt: 1, pb: '16px !important', backgroundColor: theme.palette.mode === 'dark' ? '#15202b' : '#ffffff' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, lineHeight: 1.3, mt: 0.5, mb: 1 }}>
                  {displayTwitterTitle || "Your post title will appear here"}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {displayTwitterDescription || "Your post description will appear here. This text may be truncated if it's too long for the preview card."}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                  <Link fontSize="small" sx={{ mr: 0.5, color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }} />
                  <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                    example.com
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Media Manager Modals */}
      <MediaManagerModal
        open={ogMediaManagerOpen}
        onClose={() => setOgMediaManagerOpen(false)}
        onSelect={handleOgMediaManagerSelect}
        mediaType="image"
        selectionMode="single"
      />

      <MediaManagerModal
        open={twitterMediaManagerOpen}
        onClose={() => setTwitterMediaManagerOpen(false)}
        onSelect={handleTwitterMediaManagerSelect}
        mediaType="image"
        selectionMode="single"
      />
    </Box>
  );
};

export default SocialMediaTab; 