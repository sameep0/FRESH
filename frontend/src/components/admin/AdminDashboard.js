import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  People,
  Receipt,
  AccountBalance,
  Category,
  TrendingUp,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  console.log("AdminDashboard mounted");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setError('');
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        axios.get('/admin/dashboard'),
        axios.get('/admin/users')
      ]);
      setStats(statsResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error fetching admin data';
      setError(msg);
     
      if (msg.toLowerCase().includes('token')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

 
  const activeUsersToday = stats?.activeUsersToday ?? 2;
  const mostPopularCategory = stats?.mostPopularCategory ?? 'Food';
  const largestAccount = stats?.largestAccount ?? { name: 'Savings', balance: 8500 };
  const recentSignups = stats?.recentSignups ?? 1;
  const usersTrend = stats?.usersTrend ?? 1; 
  const transactionsTrend = stats?.transactionsTrend ?? -1;
  const accountsTrend = stats?.accountsTrend ?? 1;
  const categoriesTrend = stats?.categoriesTrend ?? 0;

  const ICONS = [<People />, <Receipt />, <AccountBalance />, <Category />];
  const pieData = stats ? [
    { name: 'Users', value: stats.totalUsers },
    { name: 'Transactions', value: stats.totalTransactions },
    { name: 'Accounts', value: stats.totalAccounts },
    { name: 'Categories', value: stats.totalCategories }
  ] : [];
  const total = pieData.reduce((sum, d) => sum + d.value, 0);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <img src="/Titlelogo.png" alt="App Logo" style={{ width: 56, height: 56, marginBottom: 8, borderRadius: 8, background: '#23232a', boxShadow: '0 2px 12px 0 rgba(120,80,255,0.10)' }} />
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button size="small" variant="outlined" onClick={handleRefresh}>Refresh</Button>
      </Box>
      
      {}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h4">{stats?.totalUsers || 0}</Typography>
                    {usersTrend > 0 && <ArrowUpward color="success" sx={{ ml: 1 }} />}
                    {usersTrend < 0 && <ArrowDownward color="error" sx={{ ml: 1 }} />}
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Active Today: {activeUsersToday}
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
                <Receipt color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Transactions
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h4">{stats?.totalTransactions || 0}</Typography>
                    {transactionsTrend > 0 && <ArrowUpward color="success" sx={{ ml: 1 }} />}
                    {transactionsTrend < 0 && <ArrowDownward color="error" sx={{ ml: 1 }} />}
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Recent Signups: {recentSignups}
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
                <AccountBalance color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Accounts
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h4">{stats?.totalAccounts || 0}</Typography>
                    {accountsTrend > 0 && <ArrowUpward color="success" sx={{ ml: 1 }} />}
                    {accountsTrend < 0 && <ArrowDownward color="error" sx={{ ml: 1 }} />}
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Largest: {largestAccount.name} (${largestAccount.balance})
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
                <Category color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Categories
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h4">{stats?.totalCategories || 0}</Typography>
                    {categoriesTrend > 0 && <ArrowUpward color="success" sx={{ ml: 1 }} />}
                    {categoriesTrend < 0 && <ArrowDownward color="error" sx={{ ml: 1 }} />}
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Most Popular: {mostPopularCategory}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, position: 'relative', width: '100%', maxWidth: 700, margin: '0 auto' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5" gutterBottom>
                System Overview
              </Typography>
              <Box sx={{ position: 'absolute', top: 24, right: 32 }}>
                <Button size="medium" variant="outlined" sx={{ minWidth: 100, fontSize: 18 }} onClick={() => alert('Export system stats coming soon!')}>Export</Button>
              </Box>
            </Box>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="flex-start" justifyContent="center">
              <ResponsiveContainer width={320} height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    isAnimationActive={true}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}`, `${name}`]} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ ml: 6, mt: { xs: 4, md: 0 } }}>
                {pieData.map((item, index) => (
                  <Box key={item.name} display="flex" alignItems="center" mb={2}>
                    <Box sx={{ width: 24, height: 24, bgcolor: COLORS[index], borderRadius: '6px', mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 120 }}>{item.name}</Typography>
                    <Typography variant="h6" sx={{ ml: 2 }}>{item.value} ({total ? ((item.value / total) * 100).toFixed(1) : 0}%)</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          {}
          {}
        </Grid>
      </Grid>

    </Box>
  );
};

export default AdminDashboard; 