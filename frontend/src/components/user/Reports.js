import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Assessment,
  Download,
  DateRange,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, AreaChart, Area, ReferenceLine
} from 'recharts';
import axios from 'axios';

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');

  const dateRanges = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsRes, categoriesRes, accountsRes] = await Promise.all([
        axios.get('/user/transactions'),
        axios.get('/user/categories'),
        axios.get('/user/accounts')
      ]);
      
      setTransactions(transactionsRes.data);
      setCategories(categoriesRes.data);
      setAccounts(accountsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          const endDate = new Date(customEndDate);
          filtered = filtered.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
          });
        }
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    if (dateRange !== 'custom') {
      filtered = filtered.filter(t => new Date(t.date) >= startDate);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.categoryId === parseInt(selectedCategory));
    }

    if (selectedAccount !== 'all') {
      filtered = filtered.filter(t => t.accountId === parseInt(selectedAccount));
    }

    return filtered;
  };

  const getSummaryStats = () => {
    const filteredTransactions = getFilteredTransactions();
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const netIncome = income - expenses;
    const transactionCount = filteredTransactions.length;

    return {
      income,
      expenses,
      netIncome,
      transactionCount
    };
  };

  const getIncomeExpensesData = () => {
    const filteredTransactions = getFilteredTransactions();
    const monthlyData = {};

    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += parseFloat(transaction.amount);
      } else {
        monthlyData[monthKey].expenses += parseFloat(transaction.amount);
      }
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const getCategoryBreakdown = () => {
    const filteredTransactions = getFilteredTransactions();
    const categoryData = {};

    filteredTransactions.forEach(transaction => {
      const categoryId = transaction.categoryId;
      const categoryName = categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
      
      if (!categoryData[categoryName]) {
        categoryData[categoryName] = 0;
      }
      
      categoryData[categoryName] += parseFloat(transaction.amount);
    });

    return Object.entries(categoryData).map(([name, value]) => ({
      name,
      value: Math.abs(value)
    }));
  };

  const getAccountTrends = () => {
    const filteredTransactions = getFilteredTransactions();
    const accountBalances = {};
    accounts.forEach(account => {
      accountBalances[account.id] = 0;
    });
    filteredTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        accountBalances[transaction.accountId] += parseFloat(transaction.amount);
      } else {
        accountBalances[transaction.accountId] -= parseFloat(transaction.amount);
      }
    });
    return accounts.map(account => ({
      name: account.name,
      balance: accountBalances[account.id] || 0
    }));
  };

  const exportToCSV = () => {
    const filteredTransactions = getFilteredTransactions();
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Account', 'Notes'];
    
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        `"${t.description}"`,
        t.amount,
        t.type,
        categories.find(c => c.id === t.categoryId)?.name || 'Uncategorized',
        accounts.find(a => a.id === t.accountId)?.name || 'Unknown Account',
        `"${t.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const summaryStats = getSummaryStats();
  const incomeExpensesData = getIncomeExpensesData();
  const categoryBreakdown = getCategoryBreakdown();
  const accountTrends = getAccountTrends();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, width: '100vw', minWidth: 900, overflowX: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Financial Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={exportToCSV}
        >
          Export to CSV
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                label="Date Range"
              >
                {dateRanges.map((range) => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {dateRange === 'custom' && (
            <>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
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
        </Grid>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUp color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Income
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      ${summaryStats.income.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingDown color="error" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Expenses
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      ${summaryStats.expenses.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Assessment color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Net Income
                    </Typography>
                    <Typography variant="h4" color={summaryStats.netIncome >= 0 ? 'success.main' : 'error.main'}>
                      ${summaryStats.netIncome.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AccountBalance color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Transactions
                    </Typography>
                    <Typography variant="h4">
                      {summaryStats.transactionCount}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Income vs Expenses Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={incomeExpensesData} margin={{ top: 30, right: 40, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -10, fontSize: 16 }} tick={{ fontSize: 14 }} />
                  <YAxis tickFormatter={v => `$${v.toLocaleString()}`} label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 16 }} tick={{ fontSize: 14 }} />
                  <RechartsTooltip formatter={v => `$${v.toLocaleString()}`} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 16 }} />
                  <Line type="monotone" dataKey="income" stroke="#4caf50" strokeWidth={3} name="Income" label={{ position: 'top', fontSize: 15, formatter: v => `$${v.toLocaleString()}` }} />
                  <Line type="monotone" dataKey="expenses" stroke="#f44336" strokeWidth={3} name="Expenses" label={{ position: 'top', fontSize: 15, formatter: v => `$${v.toLocaleString()}` }} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, mb: 4, minWidth: 600, width: '100%', maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Category Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent, value }) => `${name}: $${value.toLocaleString()} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={v => `$${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <Box display="flex" justifyContent="center" mt={2}>
                <Legend
                  layout="horizontal"
                  align="center"
                  payload={categoryBreakdown.map((entry, index) => ({
                    value: entry.name,
                    type: 'square',
                    color: COLORS[index % COLORS.length],
                  }))}
                  wrapperStyle={{ fontSize: 16 }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {}
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Account Balance Trends
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={accountTrends} margin={{ top: 30, right: 40, left: 40, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" label={{ value: 'Account', position: 'insideBottom', offset: -10, fontSize: 16 }} tick={{ fontSize: 16 }} interval={0} />
              <YAxis tickFormatter={v => `$${v.toLocaleString()}`} label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 16 }} tick={{ fontSize: 14 }} />
              <RechartsTooltip formatter={v => `$${v.toLocaleString()}`} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 16 }} />
              <ReferenceLine x={accountTrends[0] && accountTrends[1] ? (accountTrends[0].name + ',' + accountTrends[1].name) : ''} stroke="#888" strokeDasharray="3 3" ifOverflow="extendDomain" />
              <Bar dataKey="balance" fill="#2196f3" name="Balance"
                label={({ x, y, width, value }) => (
                  <text
                    x={x + width / 2}
                    y={y - 20}
                    textAnchor="middle"
                    fontWeight="bold"
                    fontSize="16"
                    fill="#1565c0"
                  >
                    {`$${value.toLocaleString()}`}
                  </text>
                )}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Transactions
        </Typography>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Account</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredTransactions().map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
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
                    />
                  </TableCell>
                  <TableCell>
                    {categories.find(c => c.id === transaction.categoryId)?.name || 'Uncategorized'}
                  </TableCell>
                  <TableCell>
                    {accounts.find(a => a.id === transaction.accountId)?.name || 'Unknown Account'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Reports; 