import React from 'react';
import { Drawer, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Button } from '@mui/material';
import { Dashboard, Rule, Analytics, PersonSearch, Settings, Logout } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Rule Engine', icon: <Rule />, path: '/rules' },
    { text: 'Client Watchlist', icon: <PersonSearch />, path: '/watchlist' },
    { text: 'Reports', icon: <Analytics />, path: '/reports' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  return (
    <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#2D3748', color: '#F7FAFC', borderRight: 'none' } }}>
      <Toolbar><Typography variant="h6" noWrap>ComplyPilot</Typography></Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => navigate(item.path)} selected={location.pathname === item.path} sx={{ '&.Mui-selected': { backgroundColor: 'rgba(49, 130, 206, 0.2)', color: '#3182CE', '& .MuiListItemIcon-root': { color: '#3182CE' } }, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.04)' } }}>
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ color: '#A0AEC0' }}>Logged in as:</Typography>
        <Typography variant="subtitle2" noWrap>{user}</Typography>
        <Button startIcon={<Logout />} onClick={logout} variant="outlined" fullWidth sx={{ mt: 2, color: '#A0AEC0', borderColor: '#4A5568', '&:hover': {borderColor: '#A0AEC0'} }}>Logout</Button>
      </Box>
    </Drawer>
  );
};
export default Sidebar;