import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  useTheme,
  Fade,
  Badge
} from '@mui/material';
import {
  VideoLibrary,
  Add,
  List as ListIcon
} from '@mui/icons-material';
import VideoManagement from './VideoManagement';
import ManageVideos from './ManageVideos';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`video-tabpanel-${index}`}
      aria-labelledby={`video-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const VideoManagementTabs = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [videoCount, setVideoCount] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Callback to update video count from ManageVideos component
  const handleVideoCountUpdate = (count) => {
    setVideoCount(count);
  };

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: '16px',
            background: theme.palette.background.paper,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
          }}
        >
          {/* Header Section */}
          <Box 
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 },
              pb: 0
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 4px 12px ${theme.palette.secondary.main}40`,
                }}
              >
                <VideoLibrary sx={{ color: '#fff', fontSize: 28 }} />
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
                  Social Media Videos
                </Typography>
                <Typography 
                  variant="body1" 
                  color="textSecondary"
                  sx={{ mt: 0.5 }}
                >
                  Schedule and manage videos for social media platforms
                </Typography>
              </Box>
            </Box>

            {/* Tab Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange} 
                variant="fullWidth"
                sx={{ 
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    minHeight: 56,
                    py: 2
                  },
                  '& .Mui-selected': {
                    fontWeight: 600,
                  }
                }}
              >
                <Tab 
                  label="Schedule New Video" 
                  icon={<Add fontSize="small" />} 
                  iconPosition="start"
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(0,0,0,0.02)'
                    }
                  }}
                />
                <Tab 
                  label={
                    <Badge 
                      badgeContent={videoCount} 
                      color="secondary"
                      max={999}
                      sx={{
                        '& .MuiBadge-badge': {
                          right: -12,
                          top: 2,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 2 }}>
                        Video Library
                      </Box>
                    </Badge>
                  }
                  icon={<ListIcon fontSize="small" />} 
                  iconPosition="start"
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(0,0,0,0.02)'
                    }
                  }}
                />
              </Tabs>
            </Box>
          </Box>

          {/* Tab Panels */}
          <TabPanel value={currentTab} index={0}>
            <VideoManagement />
          </TabPanel>
          
          <TabPanel value={currentTab} index={1}>
            <ManageVideos onVideoCountUpdate={handleVideoCountUpdate} />
          </TabPanel>
        </Paper>
      </Container>
    </Fade>
  );
};

export default VideoManagementTabs;

