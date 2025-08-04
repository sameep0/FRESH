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
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt,
  TrendingUp,
  TrendingDown,
  Download,
  Search,
  School,
  Fastfood,
  Home,
  BusinessCenter,
  MenuBook,
  Flight,
  Category as CategoryIcon
} from '@mui/icons-material';
import axios from 'axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exportLoading, setExportLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    categoryId: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const transactionTypes = [
    { value: 'income', label: 'Income', icon: <TrendingUp /> },
    { value: 'expense', label: 'Expense', icon: <TrendingDown /> }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'description', label: 'Description' },
    { value: 'category', label: 'Category' },
    { value: 'account', label: 'Account' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsRes, accountsRes, categoriesRes] = await Promise.all([
        axios.get('/user/transactions'),
        axios.get('/user/accounts'),
        axios.get('/user/categories')
      ]);
      
      setTransactions(transactionsRes.data);
      setAccounts(accountsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        categoryId: transaction.categoryId?.toString() || '',
        accountId: transaction.accountId?.toString() || '',
        date: new Date(transaction.date).toISOString().split('T')[0],
        notes: transaction.notes || ''
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        categoryId: '',
        accountId: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      categoryId: '',
      accountId: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        accountId: formData.accountId ? parseInt(formData.accountId) : null
      };

      if (editingTransaction) {
        await axios.put(`/user/transactions/${editingTransaction.id}`, transactionData);
      } else {
        await axios.post('/user/transactions', transactionData);
      }

      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving transaction:', error);
      setError(error.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleDelete = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`/user/transactions/${transactionId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        setError('Failed to delete transaction');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  const getFilteredAndSortedTransactions = () => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.categoryId === parseInt(filterCategory));
    }

    if (filterAccount !== 'all') {
      filtered = filtered.filter(t => t.accountId === parseInt(filterAccount));
    }

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'category':
          aValue = getCategoryName(a.categoryId).toLowerCase();
          bValue = getCategoryName(b.categoryId).toLowerCase();
          break;
        case 'account':
          aValue = getAccountName(a.accountId).toLowerCase();
          bValue = getAccountName(b.accountId).toLowerCase();
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const getPaginatedTransactions = () => {
    const filtered = getFilteredAndSortedTransactions();
    const startIndex = page * rowsPerPage;
    return filtered.slice(startIndex, startIndex + rowsPerPage);
  };

  const exportToCSV = async () => {
    setExportLoading(true);
    try {
      const filteredTransactions = getFilteredAndSortedTransactions();
      const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Account', 'Notes'];
      
      const csvContent = [
        headers.join(','),
        ...filteredTransactions.map(t => [
          new Date(t.date).toLocaleDateString(),
          `"${t.description}"`,
          t.amount,
          t.type,
          getCategoryName(t.categoryId),
          getAccountName(t.accountId),
          `"${t.notes || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      setError('Failed to export transactions');
    } finally {
      setExportLoading(false);
    }
  };

  const getSummaryStats = () => {
    const filtered = getFilteredAndSortedTransactions();
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const netIncome = income - expenses;
    
    return { income, expenses, netIncome, total: filtered.length };
  };

  const summaryStats = getSummaryStats();
  const paginatedTransactions = getPaginatedTransactions();
  const totalTransactions = getFilteredAndSortedTransactions().length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
          Transactions
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportToCSV}
            disabled={exportLoading}
            sx={{ mr: 1 }}
          >
            {exportLoading ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Transaction
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h4">
                {summaryStats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Income
              </Typography>
              <Typography variant="h4" color="success.main">
                ${summaryStats.income.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4" color="error.main">
                ${summaryStats.expenses.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Net Income
              </Typography>
              <Typography variant="h4" color={summaryStats.netIncome >= 0 ? 'success.main' : 'error.main'}>
                ${summaryStats.netIncome.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search transactions..."
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Account</InputLabel>
              <Select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                label="Account"
              >
                <MenuItem value="all">All Accounts</MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small">
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
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterCategory('all');
              setFilterAccount('all');
              setDateRange({ start: '', end: '' });
              setSortBy('date');
              setSortOrder('desc');
              setPage(0);
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {}
      <Paper>
        <TableContainer sx={{ maxHeight: '60vh', height: '60vh', overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {transaction.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="h6"
                      color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                    >
                      ${parseFloat(transaction.amount).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.type} 
                      color={transaction.type === 'income' ? 'success' : 'error'}
                      size="small"
                      icon={transaction.type === 'income' ? <TrendingUp /> : <TrendingDown />}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={(() => {
                        switch (getCategoryName(transaction.categoryId).toLowerCase()) {
                          case 'college fees':
                            return <School />;
                          case 'food':
                            return <Fastfood />;
                          case 'rent':
                            return <Home />;
                          case 'small business':
                            return <BusinessCenter />;
                          case 'teaching':
                            return <MenuBook />;
                          case 'travel':
                            return <Flight />;
                          default:
                            return <CategoryIcon />;
                        }
                      })()}
                      label={getCategoryName(transaction.categoryId)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getAccountName(transaction.accountId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {transaction.notes || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(transaction)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(transaction.id)}
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
        
        {}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, totalTransactions)} of {totalTransactions} transactions
          </Typography>
          <Box>
            <Button
              size="small"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              size="small"
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * rowsPerPage >= totalTransactions}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Paper>

      {}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.description}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="amount"
              label="Amount"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.amount}
              onChange={handleChange}
              required
              inputProps={{ step: "0.01", min: "0" }}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Type"
                required
              >
                {transactionTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center">
                      {type.icon}
                      <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                label="Category"
              >
                <MenuItem value="">
                  <em>Select a category</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel>Account</InputLabel>
              <Select
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                label="Account"
              >
                <MenuItem value="">
                  <em>Select an account</em>
                </MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="date"
              label="Date"
              type="date"
              fullWidth
              variant="outlined"
              value={formData.date}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="notes"
              label="Notes (Optional)"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTransaction ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Transactions; 