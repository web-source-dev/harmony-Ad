import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  ListSubheader,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
  AttachMoney as DonationIcon,
  PersonAdd as UserIcon,
  PersonAdd,
  Analytics as AnalyticsIcon,
  VideoLibrary as VideoIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNetwork } from '../../contexts/NetworkContext';

const menuItems = [
  { 
    text: 'Overview', 
    icon: DashboardIcon, 
    path: '/' 
  },
  { 
    text: 'Analytics', 
    icon: AnalyticsIcon, 
    path: '/analytics' 
  },
  { 
    text: 'Blogs', 
    icon: ArticleIcon, 
    path: '/blog/manage' 
  },
  { 
    text: 'Social Media', 
    icon: VideoIcon, 
    path: '/social-media' 
  },
  { 
    text: 'Contacts', 
    icon: UserIcon, 
    path: '/contacts' 
  },
  { 
    text: 'Create Contact', 
    icon: PersonAdd, 
    path: '/contacts/create' 
  },
  { 
    text: 'Donations', 
    icon: DonationIcon, 
    path: '/donations' 
  },
];

const Sidebar = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isOnline } = useNetwork();
  const drawerWidth = 240;

  // Filter menu items based on online status
  const getAvailableMenuItems = () => {
    if (isOnline) {
      return menuItems;
    } else {
      // When offline, only show Create Contact
      return menuItems.filter(item => item.path === '/contacts/create');
    }
  };

  const availableMenuItems = getAvailableMenuItems();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const drawer = (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Admin Dashboard
        </Typography>
      </Box>
      <Divider />
      <List>
        {!isOnline && (
          <ListSubheader sx={{ bgcolor: 'transparent', fontWeight: 600, color: 'warning.main' }}>
            Offline Mode
          </ListSubheader>
        )}
        {isOnline && (
          <ListSubheader sx={{ bgcolor: 'transparent', fontWeight: 600 }}>
            Platform Overview
          </ListSubheader>
        )}
        {availableMenuItems.slice(0, 2).map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={isMobile ? handleDrawerToggle : undefined}
            sx={{
              '&.Mui-selected': {
                bgcolor: `${theme.palette.primary.main}15`,
                borderRight: `3px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  bgcolor: `${theme.palette.primary.main}25`,
                },
              },
            }}
          >
            <ListItemIcon>
              <item.icon color={location.pathname === item.path ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                },
              }}
            />
          </ListItem>
        ))}
      </List>
      
      {isOnline && (
        <>
          <Divider />
          <List>
            <ListSubheader sx={{ bgcolor: 'transparent', fontWeight: 600 }}>
              Content Management
            </ListSubheader>
            {availableMenuItems.slice(2, 4).map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={isMobile ? handleDrawerToggle : undefined}
            sx={{
              '&.Mui-selected': {
                bgcolor: `${theme.palette.primary.main}15`,
                borderRight: `3px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  bgcolor: `${theme.palette.primary.main}25`,
                },
              },
            }}
          >
            <ListItemIcon>
              <item.icon color={location.pathname === item.path ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                },
              }}
            />
          </ListItem>
            ))}
          </List>
        </>
      )}

      {isOnline && (
        <>
          <Divider />
          <List>
            <ListSubheader sx={{ bgcolor: 'transparent', fontWeight: 600 }}>
              User Management
            </ListSubheader>
            {availableMenuItems.slice(4, 6).map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={isMobile ? handleDrawerToggle : undefined}
            sx={{
              '&.Mui-selected': {
                bgcolor: `${theme.palette.primary.main}15`,
                borderRight: `3px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  bgcolor: `${theme.palette.primary.main}25`,
                },
              },
            }}
          >
            <ListItemIcon>
              <item.icon color={location.pathname === item.path ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                },
              }}
            />
          </ListItem>
            ))}
          </List>
        </>
      )}

      {isOnline && (
        <>
          <Divider />
          <List>
            <ListSubheader sx={{ bgcolor: 'transparent', fontWeight: 600 }}>
              Engagement
            </ListSubheader>
            {availableMenuItems.slice(6, 7).map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={isMobile ? handleDrawerToggle : undefined}
            sx={{
              '&.Mui-selected': {
                bgcolor: `${theme.palette.primary.main}15`,
                borderRight: `3px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  bgcolor: `${theme.palette.primary.main}25`,
                },
              },
            }}
          >
            <ListItemIcon>
              <item.icon color={location.pathname === item.path ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                },
              }}
            />
          </ListItem>
            ))}
          </List>
        </>
      )}

      <Box sx={{ mt: 'auto', p: 2 }}>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            '&:hover': {
              bgcolor: `${theme.palette.error.main}15`,
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon color="error" />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            sx={{
              '& .MuiTypography-root': {
                color: 'error.main',
                fontWeight: 500,
              },
            }}
          />
        </ListItem>
      </Box>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="navigation"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar; 