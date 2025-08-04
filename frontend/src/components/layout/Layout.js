import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  AccountBalance,
  Receipt,
  Category,
  Assessment,
  Settings,
  CloudUpload,
  Logout,
  Person,
  TrendingUp,
  PieChart,
  Download
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const getAvatarUrl = (avatar) => {
  if (!avatar) return undefined;
  if (avatar.startsWith('http')) return avatar;
  return `http://localhost:3001${avatar}`;
};

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = user?.role === 'admin' ? [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Users', icon: <Person />, path: '/admin/users' },
    { text: 'System Stats', icon: <Assessment />, path: '/admin/stats' }
  ] : [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Accounts', icon: <AccountBalance />, path: '/accounts' },
    { text: 'Transactions', icon: <Receipt />, path: '/transactions' },
    { text: 'Categories', icon: <Category />, path: '/categories' },
    { text: 'Reports', icon: <PieChart />, path: '/reports' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
    { text: 'Export', icon: <Download />, path: '/export' }
  ];

  const drawer = (
    <div>
      <Toolbar>
        <img src="/Titlelogo.png" alt="App Logo" style={{ width: 40, height: 40, marginRight: 12, borderRadius: 8, background: '#23232a' }} />
        <Typography variant="h6" noWrap component="div">
          Finance Tracker
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <img src="/Titlelogo.png" alt="App Logo" style={{ width: 40, height: 40, marginRight: 12, borderRadius: 8, background: '#23232a' }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Personal Finance Tracker
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.name || user?.username}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }} src={getAvatarUrl(user?.avatar)}>
                {user?.name?.charAt(0) || user?.username?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          overflowY: 'auto',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout; 