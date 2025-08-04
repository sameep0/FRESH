import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tooltip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person,
  Notifications,
  Security,
  Palette,
  Language,
  Email,
  Phone,
  LocationOn,
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Visibility,
  VisibilityOff,
  Lock,
  NotificationsActive,
  NotificationsOff,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import axios from 'axios';
import { useThemeMode } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    budgetAlerts: true,
    transactionReminders: true,
    weeklyReports: false,
    monthlyReports: true
  });
  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : {
      darkMode: false,
      language: 'en',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    };
  });
  const [detailedError, setDetailedError] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = useRef();
  const { mode, setTheme } = useThemeMode();
  const { updateUser } = useAuth();
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '\u20ac', name: 'Euro' },
    { code: 'GBP', symbol: '\u00a3', name: 'British Pound' },
    { code: 'JPY', symbol: '\u00a5', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
  ];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' }
  ];
  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
  ];
  const timeFormats = [
    { value: '12h', label: '12-hour' },
    { value: '24h', label: '24-hour' }
  ];
  const getAvatarUrl = (avatar) => {
    if (!avatar) return '/default-avatar.png';
    if (avatar.startsWith('http')) return avatar;
    return `http://localhost:3001${avatar}`;
  };
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/profile', { withCredentials: true });
      setUser(response.data);
      setProfileData({
        name: response.data.name || '',
        username: response.data.username || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        location: response.data.location || '',
        bio: response.data.bio || ''
      });
      setDetailedError('');
      updateUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
      setDetailedError(error.response?.data?.message || error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };
  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  const handleAppSettingChange = (setting, value) => {
    setAppSettings(prev => {
      const updated = { ...prev, [setting]: value };
      localStorage.setItem('appSettings', JSON.stringify(updated));
      if (setting === 'darkMode') setTheme(value ? 'dark' : 'light');
      return updated;
    });
  };
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await axios.put('/api/profile', profileData);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }
      setSuccess('Profile updated successfully!');
      setOpenProfileDialog(false);
      fetchUserData();
      updateUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      await axios.put('/api/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password updated successfully!');
      setOpenPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error.response?.data?.message || 'Failed to update password');
    }
  };
  const handleSettingsSave = async () => {
    try {
      await axios.put('/user/settings', {
        theme: appSettings.darkMode ? 'dark' : 'light',
        notifications: notificationSettings.emailNotifications,
        cloudSync: appSettings.cloudSync || false
      });
      setSuccess('Settings saved successfully!');
      localStorage.setItem('appSettings', JSON.stringify(appSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    }
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    try {
      const res = await axios.post('http://localhost:3001/api/profile/avatar', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Profile picture updated!');
      await fetchUserData();
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      setError('Failed to upload profile picture');
    }
  };
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Settings
        </Typography>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          {detailedError && (
            <Box mt={1} fontSize={13} color="#ffb4b4">{detailedError}</Box>
          )}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <Person sx={{ mr: 1 }} />
                <Typography variant="h6">Profile Information</Typography>
              </Box>
              <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
                <Avatar
                  sx={{ width: 80, height: 80, mr: 2 }}
                  src={avatarPreview ? avatarPreview : getAvatarUrl(user?.avatar)}
                  alt="Avatar"
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <IconButton
                  component="span"
                  onClick={() => avatarInputRef.current.click()}
                  sx={{ ml: 1 }}
                >
                  <PhotoCamera />
                </IconButton>
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarInputRef}
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
                {avatarFile && (
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ ml: 2 }}
                    onClick={handleAvatarUpload}
                  >
                    Upload
                  </Button>
                )}
                <Box ml={3}>
                  <Typography variant="h6">{user?.name && user.name.trim() ? user.name : 'User'}</Typography>
                  <Typography color="textSecondary">{user?.email && user.email.trim() ? user.email : 'No email set'}</Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setOpenProfileDialog(true)}
                fullWidth
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <Security sx={{ mr: 1 }} />
                <Typography variant="h6">Security</Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Lock />
                  </ListItemIcon>
                  <ListItemText
                    primary="Change Password"
                    secondary="Update your account password"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setOpenPasswordDialog(true)}
                    >
                      Change
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <Notifications sx={{ mr: 1 }} />
                <Typography variant="h6">Notifications</Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive notifications via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActive />
                  </ListItemIcon>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive push notifications"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onChange={() => handleNotificationChange('pushNotifications')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActive />
                  </ListItemIcon>
                  <ListItemText
                    primary="Budget Alerts"
                    secondary="Get notified when approaching budget limits"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.budgetAlerts}
                      onChange={() => handleNotificationChange('budgetAlerts')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActive />
                  </ListItemIcon>
                  <ListItemText
                    primary="Transaction Reminders"
                    secondary="Reminders for recurring transactions"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.transactionReminders}
                      onChange={() => handleNotificationChange('transactionReminders')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActive />
                  </ListItemIcon>
                  <ListItemText
                    primary="Weekly Reports"
                    secondary="Receive weekly financial summaries"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onChange={() => handleNotificationChange('weeklyReports')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActive />
                  </ListItemIcon>
                  <ListItemText
                    primary="Monthly Reports"
                    secondary="Receive monthly financial summaries"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.monthlyReports}
                      onChange={() => handleNotificationChange('monthlyReports')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <Palette sx={{ mr: 1 }} />
                <Typography variant="h6">App Preferences</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={appSettings.darkMode}
                        onChange={(e) => handleAppSettingChange('darkMode', e.target.checked)}
                      />
                    }
                    label="Dark Mode"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={appSettings.language}
                      onChange={(e) => handleAppSettingChange('language', e.target.value)}
                      label="Language"
                    >
                      {languages.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={appSettings.currency}
                      onChange={(e) => handleAppSettingChange('currency', e.target.value)}
                      label="Currency"
                    >
                      {currencies.map((currency) => (
                        <MenuItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={appSettings.dateFormat}
                      onChange={(e) => handleAppSettingChange('dateFormat', e.target.value)}
                      label="Date Format"
                    >
                      {dateFormats.map((format) => (
                        <MenuItem key={format.value} value={format.value}>
                          {format.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Time Format</InputLabel>
                    <Select
                      value={appSettings.timeFormat}
                      onChange={(e) => handleAppSettingChange('timeFormat', e.target.value)}
                      label="Time Format"
                    >
                      {timeFormats.map((format) => (
                        <MenuItem key={format.value} value={format.value}>
                          {format.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Save />}
          onClick={handleSettingsSave}
        >
          Save All Settings
        </Button>
      </Box>
      <Dialog open={openProfileDialog} onClose={() => setOpenProfileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <Box component="form" onSubmit={handleProfileSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              name="name"
              label="Full Name"
              type="text"
              fullWidth
              variant="outlined"
              value={profileData.name}
              onChange={handleProfileChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="username"
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              value={profileData.username}
              onChange={handleProfileChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={profileData.email}
              onChange={handleProfileChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="phone"
              label="Phone Number"
              type="tel"
              fullWidth
              variant="outlined"
              value={profileData.phone}
              onChange={handleProfileChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="location"
              label="Location"
              type="text"
              fullWidth
              variant="outlined"
              value={profileData.location}
              onChange={handleProfileChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="bio"
              label="Bio"
              type="text"
              fullWidth
              variant="outlined"
              value={profileData.bio}
              onChange={handleProfileChange}
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenProfileDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <Box component="form" onSubmit={handlePasswordSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="currentPassword"
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              variant="outlined"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="newPassword"
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              variant="outlined"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              variant="outlined"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Change Password</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Settings; 