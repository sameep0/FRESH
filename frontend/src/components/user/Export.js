import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  Download,
  FileDownload,
  PictureAsPdf,
  TableChart,
  Backup,
  CloudDownload,
  CloudUpload,
  Schedule,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';
import axios from 'axios';

const Export = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exportProgress, setExportProgress] = useState(0);
  const [openBackupDialog, setOpenBackupDialog] = useState(false);
  
  
  const [exportOptions, setExportOptions] = useState({
    transactions: true,
    accounts: true,
    categories: true,
    reports: false
  });

 
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    useDateRange: false
  });

  
  const [exportFormat, setExportFormat] = useState('csv');

  
  const [backupSettings, setBackupSettings] = useState({
    includeAttachments: true,
    encryptBackup: false,
    compressionLevel: 'medium'
  });

  
  const [exportHistory, setExportHistory] = useState([]);

  const exportFormats = [
    { value: 'csv', label: 'CSV', icon: <TableChart /> },
    { value: 'pdf', label: 'PDF', icon: <PictureAsPdf /> },
    { value: 'json', label: 'JSON', icon: <FileDownload /> }
  ];

  const compressionLevels = [
    { value: 'low', label: 'Low (Faster)' },
    { value: 'medium', label: 'Medium (Balanced)' },
    { value: 'high', label: 'High (Smaller file)' }
  ];

  
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('exportHistory') || '[]');
    setExportHistory(history);
  }, []);

  
  const saveExportHistory = (entry) => {
    const history = JSON.parse(localStorage.getItem('exportHistory') || '[]');
    const newHistory = [entry, ...history].slice(0, 10); // keep last 10
    localStorage.setItem('exportHistory', JSON.stringify(newHistory));
    setExportHistory(newHistory);
  };

  const handleExportOptionChange = (option) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBackupSettingChange = (setting, value) => {
    setBackupSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  
  const exportData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setExportProgress(0);

    try {
      
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      
      const params = new URLSearchParams();
      Object.entries(exportOptions).forEach(([key, value]) => {
        if (value) params.append(key, 'true');
      });
      if (dateRange.useDateRange) {
        if (dateRange.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      }

      
      let endpoint = '/user/export/csv';
      if (exportFormat === 'pdf') endpoint = '/user/export/pdf';
      if (exportFormat === 'json') endpoint = '/user/export/json';

      const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;

      const response = await axios.get(url, {
        responseType: 'blob'
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `financial_data_${new Date().toISOString().split('T')[0]}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      setSuccess(`Data exported successfully as ${exportFormat.toUpperCase()}!`);

     
      saveExportHistory({
        date: new Date().toISOString(),
        format: exportFormat,
        options: { ...exportOptions },
        dateRange: { ...dateRange },
        fileName: `financial_data_${new Date().toISOString().split('T')[0]}.${exportFormat}`
      });
    } catch (error) {
      setError('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
      setExportProgress(0);
    }
  };

  
  const createBackup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const backupData = {
        settings: backupSettings,
        timestamp: new Date().toISOString()
      };

      const response = await axios.post('/user/backup', backupData, {
        responseType: 'blob'
      });

      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_backup_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Backup created successfully!');
      setOpenBackupDialog(false);
    } catch (error) {
      console.error('Error creating backup:', error);
      setError('Failed to create backup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  
  const restoreBackup = async (file) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('backup', file);

      await axios.post('/user/restore', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Backup restored successfully! Please refresh the page.');
    } catch (error) {
      console.error('Error restoring backup:', error);
      setError('Failed to restore backup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      restoreBackup(file);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          <Download sx={{ mr: 1, verticalAlign: 'middle' }} />
          Export & Backup
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <FileDownload sx={{ mr: 1, verticalAlign: 'middle' }} />
                Export Data
              </Typography>
              
              <FormGroup sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.transactions}
                      onChange={() => handleExportOptionChange('transactions')}
                    />
                  }
                  label="Transactions"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.accounts}
                      onChange={() => handleExportOptionChange('accounts')}
                    />
                  }
                  label="Accounts"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.categories}
                      onChange={() => handleExportOptionChange('categories')}
                    />
                  }
                  label="Categories"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.reports}
                      onChange={() => handleExportOptionChange('reports')}
                    />
                  }
                  label="Reports & Analytics"
                />
              </FormGroup>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Export Format
              </Typography>
              <Box sx={{ mb: 2 }}>
                {exportFormats.map((format) => (
                  <Chip
                    key={format.value}
                    icon={format.icon}
                    label={format.label}
                    onClick={() => setExportFormat(format.value)}
                    color={exportFormat === format.value ? 'primary' : 'default'}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={dateRange.useDateRange}
                    onChange={(e) => handleDateRangeChange('useDateRange', e.target.checked)}
                  />
                }
                label="Use Date Range"
              />

              {dateRange.useDateRange && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Start Date"
                        value={dateRange.startDate}
                        onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="End Date"
                        value={dateRange.endDate}
                        onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={exportData}
                  disabled={loading || !Object.values(exportOptions).some(Boolean)}
                  fullWidth
                >
                  {loading ? 'Exporting...' : 'Export Data'}
                </Button>
              </Box>

              {loading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={exportProgress} />
                  <Typography variant="caption" color="textSecondary">
                    {exportProgress}% Complete
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Backup sx={{ mr: 1, verticalAlign: 'middle' }} />
                Backup & Restore
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CloudDownload />
                  </ListItemIcon>
                  <ListItemText
                    primary="Create Backup"
                    secondary="Download a complete backup of your data"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setOpenBackupDialog(true)}
                    >
                      Create
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CloudUpload />
                  </ListItemIcon>
                  <ListItemText
                    primary="Restore Backup"
                    secondary="Restore data from a previous backup"
                  />
                  <ListItemSecondaryAction>
                    <input
                      accept=".zip,.backup"
                      style={{ display: 'none' }}
                      id="restore-file"
                      type="file"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="restore-file">
                      <Button
                        variant="outlined"
                        size="small"
                        component="span"
                        disabled={loading}
                      >
                        Restore
                      </Button>
                    </label>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Backup Information
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Info color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Last Backup"
                    secondary="Never (No backups found)"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data Included"
                    secondary="All transactions, accounts, categories, and settings"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Security Note"
                    secondary="Backups contain sensitive financial data. Store securely."
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Export History
              </Typography>
              {exportHistory.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    No export history available
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Your export history will appear here after you export data
                  </Typography>
                </Paper>
              ) : (
                <List>
                  {exportHistory.map((entry, idx) => (
                    <ListItem key={idx} divider>
                      <ListItemIcon>
                        {entry.format === 'csv' ? <TableChart /> : entry.format === 'pdf' ? <PictureAsPdf /> : <FileDownload />}
                      </ListItemIcon>
                      <ListItemText
                        primary={`Exported as ${entry.format.toUpperCase()} (${entry.fileName})`}
                        secondary={
                          <>
                            <span>Options: {Object.keys(entry.options).filter(k => entry.options[k]).join(', ')}</span><br/>
                            <span>Date: {new Date(entry.date).toLocaleString()}</span>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {}
      <Dialog open={openBackupDialog} onClose={() => setOpenBackupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Backup</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Configure backup settings before creating your backup file.
          </Typography>
          
          <FormGroup sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={backupSettings.includeAttachments}
                  onChange={(e) => handleBackupSettingChange('includeAttachments', e.target.checked)}
                />
              }
              label="Include Attachments"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={backupSettings.encryptBackup}
                  onChange={(e) => handleBackupSettingChange('encryptBackup', e.target.checked)}
                />
              }
              label="Encrypt Backup (Recommended)"
            />
          </FormGroup>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Compression Level</InputLabel>
            <Select
              value={backupSettings.compressionLevel}
              onChange={(e) => handleBackupSettingChange('compressionLevel', e.target.value)}
              label="Compression Level"
            >
              {compressionLevels.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Backup includes:</strong> All your financial data, settings, and preferences.
              This file can be used to restore your data on any device.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBackupDialog(false)}>Cancel</Button>
          <Button
            onClick={createBackup}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Backup'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Export; 