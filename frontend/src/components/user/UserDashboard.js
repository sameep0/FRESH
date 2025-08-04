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
  LinearProgress,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/user/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Color palette for charts (unused but kept for future use)
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Data for pie charts (unused but kept for future use)
  const pieData = dashboardData?.monthlySummary ? [
    { name: 'Income', value: dashboardData.monthlySummary.income },
    { name: 'Expenses', value: dashboardData.monthlySummary.expense }
  ] : [];

  // Category breakdown data (unused but kept for future use)
  const categoryBreakdown = dashboardData?.categoryBreakdown ? [
    { name: 'Income', value: dashboardData.categoryBreakdown.income },
    { name: 'Expenses', value: dashboardData.categoryBreakdown.expense }
  ] : [];

  // Budget data for charts (unused but kept for future use)
  const budgetData = dashboardData?.budgetProgress?.map(item => ({
    name: item.category,
    budget: item.budget,
    spent: item.spent,
    remaining: item.remaining
  })) || [];

  const getAvatarUrl = (avatar) => {
    if (!avatar) return undefined;
    if (avatar.startsWith('http')) return avatar;
    return `http://localhost:3001${avatar}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 'auto', overflowY: 'auto', p: 2 }}>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="flex-start" justifyContent="space-between" gap={3}>
        <Box flex={1} minWidth={0}>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              src={getAvatarUrl(user?.avatar)}
              sx={{ width: 56, height: 56, mr: 2, boxShadow: 2 }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="h4" fontWeight={700}>
              Welcome back, {user?.name || 'User'}!
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={600} mb={2} mt={2} color="textSecondary">Total Financials</Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(90deg, #23232a 0%, #18181b 100%)', boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Assessment color="primary" sx={{ mr: 2, fontSize: 32 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Transactions
                      </Typography>
                      <Typography variant="h4" color="white">
                        {dashboardData?.totalTransactions || 6}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(90deg, #23232a 0%, #18181b 100%)', boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <TrendingUp color="success" sx={{ mr: 2, fontSize: 32 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Income
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        ${dashboardData?.totalIncome?.toFixed(2) || '1,500.00'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(90deg, #23232a 0%, #18181b 100%)', boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <TrendingDown color="error" sx={{ mr: 2, fontSize: 32 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Expenses
                      </Typography>
                      <Typography variant="h4" color="error.main">
                        ${dashboardData?.totalExpenses?.toFixed(2) || '1,400.00'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(90deg, #23232a 0%, #18181b 100%)', boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <BarChartIcon color="success" sx={{ mr: 2, fontSize: 32 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Net Income
                      </Typography>
                      <Typography variant="h4" color={((dashboardData?.totalIncome || 1500) - (dashboardData?.totalExpenses || 1400)) >= 0 ? 'success.main' : 'error.main'}>
                        ${((dashboardData?.totalIncome || 1500) - (dashboardData?.totalExpenses || 1400)).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Typography variant="h5" fontWeight={600} mb={2} mt={2} color="textSecondary">Monthly Financials</Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(90deg, #23232a 0%, #18181b 100%)', boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <TrendingUp color="success" sx={{ mr: 2, fontSize: 32 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Monthly Income
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        ${dashboardData?.monthlySummary?.income?.toFixed(2) || '2,500.00'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(90deg, #23232a 0%, #18181b 100%)', boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <TrendingDown color="error" sx={{ mr: 2, fontSize: 32 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Monthly Expenses
                      </Typography>
                      <Typography variant="h4" color="error.main">
                        ${dashboardData?.monthlySummary?.expense?.toFixed(2) || '1,200.00'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(90deg, #23232a 0%, #18181b 100%)', boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <BarChartIcon color="success" sx={{ mr: 2, fontSize: 32 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Net Income
                      </Typography>
                      <Typography variant="h4" color={((dashboardData?.monthlySummary?.income || 2500) - (dashboardData?.monthlySummary?.expense || 1200)) >= 0 ? 'success.main' : 'error.main'}>
                        ${((dashboardData?.monthlySummary?.income || 2500) - (dashboardData?.monthlySummary?.expense || 1200)).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ display: 'none' }} />
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Card sx={{ minHeight: 220, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Income vs Expenses</Typography>
                  <Box height={180}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={
                        dashboardData?.monthlySummary
                          ? [
                              {
                                name: 'This Month',
                                Income: dashboardData.monthlySummary.income || 0,
                                Expenses: dashboardData.monthlySummary.expense || 0,
                              },
                            ]
                          : [
                              { name: 'This Month', Income: 2500, Expenses: 1200 },
                            ]
                      } barCategoryGap={40}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Income" fill="#10b981" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="Expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={7}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12} lg={12}>
                  <Card sx={{ minHeight: 220, boxShadow: 2, mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={2}>Recent Transactions</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>Amount</TableCell>
                              <TableCell>Type</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? dashboardData.recentTransactions : [
                              { date: '2024-06-01', description: 'Salary', amount: 2000, type: 'Income' },
                              { date: '2024-06-03', description: 'Groceries', amount: -150, type: 'Expense' },
                              { date: '2024-06-05', description: 'Rent', amount: -800, type: 'Expense' },
                            ]).map((tx, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{tx.date}</TableCell>
                                <TableCell>{tx.description}</TableCell>
                                <TableCell style={{ color: tx.amount < 0 ? '#ef4444' : '#10b981' }}>
                                  {tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
                                </TableCell>
                                <TableCell>{tx.type}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {dashboardData?.budgetProgress && dashboardData.budgetProgress.length > 0 && (
            <Paper sx={{ p: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Budget Progress
              </Typography>
              <Grid container spacing={2}>
                {dashboardData.budgetProgress.map((budget) => (
                  <Grid item xs={12} md={6} key={budget.category}>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2">{budget.category}</Typography>
                        <Typography variant="body2">
                          ${budget.spent.toFixed(2)} / ${budget.budget.toFixed(2)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(budget.percentage, 100)}
                        color={budget.percentage > 90 ? 'error' : budget.percentage > 75 ? 'warning' : 'primary'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        {budget.percentage.toFixed(1)}% used
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
          {dashboardData?.accounts && dashboardData.accounts.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Your Accounts
              </Typography>
              <Grid container spacing={2}>
                {dashboardData.accounts.map((account) => (
                  <Grid item xs={12} sm={6} md={4} key={account.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {account.name}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                          {account.type}
                        </Typography>
                        <Typography variant="h5" color="primary">
                          ${parseFloat(account.balance).toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </Box>
        <Box sx={{ minWidth: 350, maxWidth: 420, width: '100%', alignSelf: 'flex-start' }}>
          <Paper sx={{ p: 3, mb: 4, width: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, fontSize: 22, mb: 2 }}>
              Bank Money Flow
            </Typography>
            {(() => {
              const sampleTransactions = dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? dashboardData.recentTransactions : [
                { date: '2024-06-01', description: 'Salary', amount: 2000, type: 'Income', account: 'Nabil' },
                { date: '2024-06-03', description: 'Groceries', amount: -150, type: 'Expense', account: 'Nabil' },
                { date: '2024-06-05', description: 'Rent', amount: -800, type: 'Expense', account: 'Nabil' },
                { date: '2024-06-07', description: 'Freelance', amount: 1200, type: 'Income', account: 'Prime' },
                { date: '2024-06-09', description: 'Shopping', amount: -400, type: 'Expense', account: 'Prime' },
              ];
              const accounts = ['Nabil', 'Prime'];
              const flowData = accounts.map(acc => {
                const inflow = sampleTransactions.filter(tx => (tx.account || 'Nabil') === acc && tx.type === 'Income').reduce((sum, tx) => sum + (tx.amount > 0 ? tx.amount : 0), 0);
                const outflow = sampleTransactions.filter(tx => (tx.account || 'Nabil') === acc && tx.type === 'Expense').reduce((sum, tx) => sum + (tx.amount < 0 ? -tx.amount : 0), 0);
                return { name: acc, inflow, outflow };
              });
              const totalInflow = flowData.reduce((sum, b) => sum + (b.inflow || 0), 0);
              const totalOutflow = flowData.reduce((sum, b) => sum + (b.outflow || 0), 0);
              const netFlow = totalInflow - totalOutflow;
              return (
                <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" px={1}>
                  <Box>
                    <Typography variant="body2" color="success.main" fontWeight={600}>Total Inflow: ${totalInflow.toLocaleString()}</Typography>
                    <Typography variant="body2" color="error.main" fontWeight={600}>Total Outflow: ${totalOutflow.toLocaleString()}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={700} color={netFlow >= 0 ? 'success.main' : 'error.main'}>
                      Net Flow: ${netFlow.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              );
            })()}
            {(dashboardData?.bankFlowData && dashboardData.bankFlowData.length === 0) ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={300}>
                <Typography color="textSecondary" fontStyle="italic">No bank flow data available.</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={(() => {
                    const sampleTransactions = dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? dashboardData.recentTransactions : [
                      { date: '2024-06-01', description: 'Salary', amount: 2000, type: 'Income', account: 'Nabil' },
                      { date: '2024-06-03', description: 'Groceries', amount: -150, type: 'Expense', account: 'Nabil' },
                      { date: '2024-06-05', description: 'Rent', amount: -800, type: 'Expense', account: 'Nabil' },
                      { date: '2024-06-07', description: 'Freelance', amount: 1200, type: 'Income', account: 'Prime' },
                      { date: '2024-06-09', description: 'Shopping', amount: -400, type: 'Expense', account: 'Prime' },
                    ];
                    const accounts = ['Nabil', 'Prime'];
                    return accounts.map(acc => {
                      const inflow = sampleTransactions.filter(tx => (tx.account || 'Nabil') === acc && tx.type === 'Income').reduce((sum, tx) => sum + (tx.amount > 0 ? tx.amount : 0), 0);
                      const outflow = sampleTransactions.filter(tx => (tx.account || 'Nabil') === acc && tx.type === 'Expense').reduce((sum, tx) => sum + (tx.amount < 0 ? -tx.amount : 0), 0);
                      return { name: acc, inflow, outflow };
                    });
                  })()}
                  margin={{ top: 20, right: 20, left: 10, bottom: 30 }}
                  barCategoryGap={24}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" label={{ value: 'Bank', position: 'insideBottom', offset: -10, fontSize: 15 }} tick={{ fontSize: 15 }} interval={0} />
                  <YAxis tickFormatter={v => `$${v.toLocaleString()}`} label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 15 }} tick={{ fontSize: 13 }} />
                  <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                  <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: 15 }} iconType="rect" />
                  <Bar dataKey="inflow" fill="#4caf50" name="Inflow" radius={[8, 8, 0, 0]}>
                    <LabelList dataKey="inflow" position="top" formatter={v => v ? `$${v.toLocaleString()}` : ''} style={{ fontWeight: 600, fontSize: 13 }} />
                  </Bar>
                  <Bar dataKey="outflow" fill="#f44336" name="Outflow" radius={[8, 8, 0, 0]}>
                    <LabelList dataKey="outflow" position="top" formatter={v => v ? `$${v.toLocaleString()}` : ''} style={{ fontWeight: 600, fontSize: 13 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;