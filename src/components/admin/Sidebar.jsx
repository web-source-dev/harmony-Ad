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
  People as PeopleIcon,
  Article as ArticleIcon,
  Work as WorkIcon,
  Mail as MailIcon,
  Chat as ChatIcon,
  Support as SupportIcon,
  Settings as SettingsIcon,
  Subscriptions as SubscriptionsIcon,
  VolunteerActivism as VolunteerIcon,
  AttachMoney as DonationIcon,
  PersonAdd as UserIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

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
    text: 'Customers', 
    icon: UserIcon, 
    path: '/customers' 
  },
  { 
    text: 'Donations', 
    icon: DonationIcon, 
    path: '/donations' 
  },
];

const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const drawerWidth = 240;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Admin Dashboard
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListSubheader sx={{ bgcolor: 'transparent', fontWeight: 600 }}>
          Platform Overview
        </ListSubheader>
        {menuItems.slice(0, 2).map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
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
      
      <Divider />
      <List>
        <ListSubheader sx={{ bgcolor: 'transparent', fontWeight: 600 }}>
          Content Management
        </ListSubheader>
        {menuItems.slice(2, 3).map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
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

      <Divider />
      <List>
        <ListSubheader sx={{ bgcolor: 'transparent', fontWeight: 600 }}>
          User Management
        </ListSubheader>
        {menuItems.slice(3, 4).map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
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

      <Divider />
      <List>
        <ListSubheader sx={{ bgcolor: 'transparent', fontWeight: 600 }}>
          Engagement
        </ListSubheader>
        {menuItems.slice(4, 5).map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
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
    </Drawer>
  );
};

export default Sidebar; 