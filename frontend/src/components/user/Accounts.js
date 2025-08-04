import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance,
  Search
} from '@mui/icons-material';
import axios from 'axios';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    balance: '',
    currency: 'USD',
    description: ''
  });

  const accountTypes = [
    'Checking',
    'Savings',
    'Credit Card',
    'Investment',
    'Loan',
    'Cash',
    'Other'
  ];

  const currencies = [
    'USD',
    'EUR',
    'GBP',
    'JPY',
    'CAD',
    'AUD',
    'CHF'
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'type', label: 'Type' },
    { value: 'balance', label: 'Balance' },
    { value: 'currency', label: 'Currency' }
  ];

 
  const getAccountTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return '🏦';
      case 'savings':
        return '💰';
      case 'credit card':
        return '💳';
      case 'investment':
        return '📈';
      case 'loan':
        return '🏠';
      case 'cash':
        return '💵';
      default:
        return '🏛️';
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
    
      const response = await axios.get(`/user/accounts?_=${Date.now()}`);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        currency: account.currency || 'USD',
        description: account.description || ''
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        type: '',
        balance: '',
        currency: 'USD',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAccount(null);
    setFormData({
      name: '',
      type: '',
      balance: '',
      currency: 'USD',
      description: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const accountData = {
        ...formData,
        balance: parseFloat(formData.balance)
      };

      let response;
      if (editingAccount) {
        response = await axios.put(`/user/accounts/${editingAccount.id}`, accountData);
      } else {
        response = await axios.post('/user/accounts', accountData);
      }
      console.log('Account save response:', response.data);
      setSuccess('Account saved successfully!');
      handleCloseDialog();
      fetchAccounts();
    } catch (error) {
      console.error('Error saving account:', error, error.response);
      setError(error.response?.data?.message || error.message || 'Failed to save account');
    }
  };

  const handleDelete = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await axios.delete(`/user/accounts/${accountId}`);
        fetchAccounts();
      } catch (error) {
        console.error('Error deleting account:', error);
        setError('Failed to delete account');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

 
  const getFilteredAndSortedAccounts = () => {
    let filtered = [...accounts];

    
    if (searchTerm) {
      filtered = filtered.filter(account => 
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    
    if (filterType !== 'all') {
      filtered = filtered.filter(account => account.type === filterType);
    }

   
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        case 'balance':
          aValue = parseFloat(a.balance);
          bValue = parseFloat(b.balance);
          break;
        case 'currency':
          aValue = a.currency.toLowerCase();
          bValue = b.currency.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const getSummaryStats = () => {
    const filtered = getFilteredAndSortedAccounts();
    const totalBalance = filtered.reduce((sum, account) => sum + parseFloat(account.balance), 0);
    const positiveBalance = filtered
      .filter(account => parseFloat(account.balance) >= 0)
      .reduce((sum, account) => sum + parseFloat(account.balance), 0);
    const negativeBalance = filtered
      .filter(account => parseFloat(account.balance) < 0)
      .reduce((sum, account) => sum + parseFloat(account.balance), 0);
    
    return {
      totalAccounts: filtered.length,
      totalBalance,
      positiveBalance,
      negativeBalance
    };
  };

  const filteredAccounts = getFilteredAndSortedAccounts();
  const summaryStats = getSummaryStats();

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
          <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
          My Accounts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Account
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Accounts
              </Typography>
              <Typography variant="h4">
                {summaryStats.totalAccounts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Balance
              </Typography>
              <Typography variant="h4" color={summaryStats.totalBalance >= 0 ? 'success.main' : 'error.main'}>
                ${summaryStats.totalBalance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Positive Balance
              </Typography>
              <Typography variant="h4" color="success.main">
                ${summaryStats.positiveBalance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Negative Balance
              </Typography>
              <Typography variant="h4" color="error.main">
                ${summaryStats.negativeBalance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Account Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                {accountTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {getAccountTypeIcon(type)} {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </Button>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setSortBy('name');
              setSortOrder('asc');
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="h6" sx={{ mr: 1 }}>
                        {getAccountTypeIcon(account.type)}
                      </Typography>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {account.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {account.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={account.type} 
                      color="primary" 
                      variant="outlined"
                      size="small"
                      icon={<span>{getAccountTypeIcon(account.type)}</span>}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="h6"
                      color={parseFloat(account.balance) >= 0 ? 'success.main' : 'error.main'}
                      sx={{
                        fontWeight: 'bold',
                        textShadow: parseFloat(account.balance) >= 0 ? '0 0 10px rgba(76, 175, 80, 0.3)' : '0 0 10px rgba(244, 67, 54, 0.3)'
                      }}
                    >
                      {account.currency} {parseFloat(account.balance).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={account.currency} 
                      color="secondary" 
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {account.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(account)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(account.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAccount ? 'Edit Account' : 'Add New Account'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Account Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              select
              margin="dense"
              name="type"
              label="Account Type"
              fullWidth
              variant="outlined"
              value={formData.type}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            >
              {accountTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="balance"
              label="Current Balance"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.balance}
              onChange={handleChange}
              required
              inputProps={{ step: "0.01" }}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              margin="dense"
              name="currency"
              label="Currency"
              fullWidth
              variant="outlined"
              value={formData.currency}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            >
              {currencies.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="description"
              label="Description (Optional)"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingAccount ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Accounts; 