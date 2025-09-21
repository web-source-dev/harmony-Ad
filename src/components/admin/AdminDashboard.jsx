import React, { useState } from 'react';
import { Box, Container, useMediaQuery, useTheme, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from './Sidebar';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useNetwork } from '../../contexts/NetworkContext';
import OfflineMessage from './OfflineMessage';

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isOnline } = useNetwork();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Check if current page is the Create Contact page
  const isCreateContactPage = location.pathname === '/contacts/create';

  // If offline and not on Create Contact page, show offline message
  if (!isOnline && !isCreateContactPage) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar 
          mobileOpen={mobileOpen} 
          handleDrawerToggle={handleDrawerToggle}
          isMobile={isMobile}
        />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            width: { md: `calc(100% - 240px)` },
            mt: { xs: '64px', md: 0 }
          }}
        >
          <OfflineMessage onRetry={handleRetry} showCreateContact={true} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - 240px)` },
            ml: { md: '240px' },
            display: { md: 'none' },
            backgroundColor: '#fff',
            color: '#000',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ color: '#000' }}>
              Admin Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          width: { md: `calc(100% - 240px)` },
          mt: { xs: '64px', md: 0 }
        }}
      >
        <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 4, px: { xs: 2, md: 3 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 