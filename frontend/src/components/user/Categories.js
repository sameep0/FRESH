import React, { useState, useEffect, useRef } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category,
  Search,
  TrendingUp,
  TrendingDown,
  Palette,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugReportIcon,
  School,
  Fastfood,
  Home,
  BusinessCenter,
  MenuBook,
  Flight,
  Category as CategoryIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import axios from 'axios';

const ICON_PATHS = {
  'college fees': 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z', 
  'food': 'M11.57 13.16l-1.41-1.41c-.78-.78-.78-2.05 0-2.83l2.83-2.83c.78-.78 2.05-.78 2.83 0l1.41 1.41c.78.78.78 2.05 0 2.83l-2.83 2.83c-.78.78-2.05.78-2.83 0z', 
  'rent': 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', 
  'small business': 'M20 6h-4V4c0-1.1-.9-2-2-2s-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8-2h4v2h-4V4zm8 14H4V8h16v10z', 
  'teaching': 'M21 6h-2V3c0-.55-.45-1-1-1H6c-.55 0-1 .45-1 1v3H3c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h1v9c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-9h1c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1zm-4 0H7V4h10v2zm2 12H5v-9h14v9zm2-11H3V7h18v-1z', 
  'travel': 'M21 6.5a2.5 2.5 0 0 0-5 0c0 .28.05.55.13.8l-5.7 5.7c-.25-.08-.52-.13-.8-.13a2.5 2.5 0 1 0 2.5 2.5c0-.28-.05-.55-.13-.8l5.7-5.7c.25.08.52.13.8.13a2.5 2.5 0 0 0 2.5-2.5z', 
  'default': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' 
};

const iconMap = {
  'college fees': School,
  'food': Fastfood,
  'rent': Home,
  'small business': BusinessCenter,
  'teaching': MenuBook,
  'travel': Flight,
  'default': CategoryIcon
};

const pieCenter = { x: 0, y: 0 };
const pieRadius = 120;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#1976d2',
    description: ''
  });
  const [dbInfo, setDbInfo] = useState(null);
  const [dbInfoError, setDbInfoError] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [createCategoryData, setCreateCategoryData] = useState({
    name: '',
    type: 'income',
    color: '#1976d2',
    description: ''
  });

  const categoryTypes = [
    { value: 'income', label: 'Income', icon: <TrendingUp /> },
    { value: 'expense', label: 'Expense', icon: <TrendingDown /> }
  ];

  const colorOptions = [
    '#1976d2', '#dc004e', '#388e3c', '#f57c00', '#7b1fa2',
    '#303f9f', '#c2185b', '#388e3c', '#fbc02d', '#5d4037',
    '#455a64', '#e91e63', '#009688', '#ff9800', '#9c27b0'
  ];

  useEffect(() => {
    fetchData();
  }, []);

 
  useEffect(() => {
    axios.get('/debug/dbinfo')
      .then(res => setDbInfo(res.data))
      .catch(() => setDbInfoError('Could not fetch DB info'));
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching categories and transactions...');
      const [categoriesRes, transactionsRes] = await Promise.all([
        axios.get('/user/categories'),
        axios.get('/user/transactions')
      ]);
      
      console.log('Categories response:', categoriesRes.data);
      console.log('Transactions response:', transactionsRes.data);
      
      setCategories(categoriesRes.data);
      setTransactions(transactionsRes.data);
      
      console.log('All categories from backend:', categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response?.data);
      setError(`Failed to load data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        type: category.type,
        color: category.color || '#1976d2',
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        type: 'expense',
        color: '#1976d2',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      type: 'expense',
      color: '#1976d2',
      description: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    
    if ('UserId' in formData) {
      console.warn('UserId was present in formData, removing before sending:', formData.UserId);
      delete formData.UserId;
    }

    try {
      console.log('Submitting category data:', formData);
      
      if (editingCategory) {
        console.log('Updating category:', editingCategory.id);
        await axios.put(`/user/categories/${editingCategory.id}`, formData);
      } else {
        console.log('Creating new category');
        await axios.post('/user/categories', formData);
      }

      console.log('Category saved successfully');
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will affect all associated transactions.')) {
      try {
        await axios.delete(`/user/categories/${categoryId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Failed to delete category');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  
  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

 
  const getCategoryStats = (categoryId) => {
    const categoryTransactions = transactions.filter(t => t.categoryId === categoryId);
    const totalAmount = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const transactionCount = categoryTransactions.length;
    const avgAmount = transactionCount > 0 ? totalAmount / transactionCount : 0;
    
    return {
      totalAmount,
      transactionCount,
      avgAmount
    };
  };

  
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || category.type === filterType;
    return matchesSearch && matchesType;
  });

  
  const combinedPieData = categories
    .map(cat => {
      const stats = getCategoryStats(cat.id);
      return {
        name: cat.name,
        value: stats.totalAmount,
        color: cat.color
      };
    })
    .filter(item => item.value > 0);

  const handleDebugMode = async () => {
    setDebugMode(!debugMode);
    if (!debugMode) {
      try {
        const response = await axios.get('/user/categories');
        setDebugInfo({
          categories: response.data,
          totalCount: response.data.length,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Debug fetch error:', error);
        setDebugInfo({ error: error.message });
      }
    }
  };

  const handleCreateDebugCategory = async () => {
    try {
      const response = await axios.post('/debug/create-category', createCategoryData);
      console.log('Debug category created:', response.data);
      setCreateCategoryData({ name: '', type: 'income', color: '#1976d2', description: '' });
      fetchData(); 
    } catch (error) {
      console.error('Debug create error:', error);
      alert(error.response?.data?.message || 'Failed to create category');
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
    <Box sx={{ height: '100vh', width: '100vw', overflowY: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
          Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {}
      {dbInfo && (
        <Box sx={{ mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #ddd' }}>
          <Typography variant="caption" color="textSecondary">
            Connected to MySQL DB: <b>{dbInfo.database}</b> as <b>{dbInfo.username}</b> on <b>{dbInfo.host}</b>
          </Typography>
        </Box>
      )}
      {dbInfoError && (
        <Alert severity="warning">{dbInfoError}</Alert>
      )}

      {}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search categories..."
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
          <Grid item xs={8} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Filter by Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} md={2} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              fullWidth
              sx={{ minWidth: 0 }}
            >
              Add Category
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Categories
              </Typography>
              <Typography variant="h4">
                {categories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Income Categories
              </Typography>
              <Typography variant="h4" color="success.main">
                {categories.filter(cat => cat.type === 'income').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Expense Categories
              </Typography>
              <Typography variant="h4" color="error.main">
                {categories.filter(cat => cat.type === 'expense').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {}
      {combinedPieData.length > 0 && (
        <Paper sx={{ p: 2, mb: 4, position: 'relative', height: 420 }}>
          <Typography variant="h6" gutterBottom>
            Category Distribution by Amount
          </Typography>
          <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={combinedPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={(props) => {
                    const { cx, cy, midAngle, outerRadius, percent, index } = props;
                    const RADIAN = Math.PI / 180;
                    const isSmall = percent < 0.07;
                    const radius = outerRadius + (isSmall ? 30 : 10);
                    let xPos = cx + radius * Math.cos(-midAngle * RADIAN);
                    let yPos = cy + radius * Math.sin(-midAngle * RADIAN);
                    if (isSmall) {
                      yPos += (index % 2 === 0 ? -1 : 1) * 18;
                    }
                    const sx = cx + outerRadius * Math.cos(-midAngle * RADIAN);
                    const sy = cy + outerRadius * Math.sin(-midAngle * RADIAN);
                    return (
                      <polyline
                        points={`${sx},${sy} ${xPos},${yPos}`}
                        stroke={props.fill}
                        fill="none"
                        strokeWidth={2}
                      />
                    );
                  }}
                  label={({ name, percent, x, y, cx, cy, midAngle, outerRadius, index, color }) => {
                    
                    const RADIAN = Math.PI / 180;
                    const isSmall = percent < 0.07;
                    const labelRadius = outerRadius + (isSmall ? 30 : 10);
                    let xPos = cx + labelRadius * Math.cos(-midAngle * RADIAN);
                    let yPos = cy + labelRadius * Math.sin(-midAngle * RADIAN);
                    if (isSmall) {
                      yPos += (index % 2 === 0 ? -1 : 1) * 18;
                    }
                    return (
                      <text
                        x={xPos}
                        y={yPos}
                        fill={color}
                        textAnchor={xPos > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        fontSize={isSmall ? 16 : 15}
                        fontWeight={isSmall ? 700 : 500}
                        style={{ alignmentBaseline: 'middle' }}
                      >
                        {name} {(percent * 100).toFixed(0)}%
                      </text>
                    );
                  }}
                  outerRadius={pieRadius}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {combinedPieData.map((entry, index) => (
                    <Cell key={`combined-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      {}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2">
          Showing {filteredCategories.length} of {categories.length} categories
          {categories.length === 0 && ' (No categories found)'}
        </Typography>
        {(searchTerm || filterType !== 'all') && (
          <Button size="small" onClick={() => { setSearchTerm(''); setFilterType('all'); }}>
            Clear Filters
          </Button>
        )}
      </Box>
      {}
      {filteredCategories.length < categories.length && (
        <Box sx={{ mb: 1 }}>
          <Typography color="warning.main" variant="body2">
            Some categories are hidden by filters or search. Clear filters to see all.
          </Typography>
        </Box>
      )}
      <Box display="flex" justifyContent="flex-end" sx={{ mb: 1 }}>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => {
            console.log('Current categories state:', categories);
            console.log('Current transactions state:', transactions);
            console.log('Filtered categories:', filteredCategories);
          }}
          sx={{ mr: 1 }}
        >
          Debug
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<BugReportIcon />}
          onClick={handleDebugMode}
          color={debugMode ? "error" : "primary"}
        >
          {debugMode ? "Hide Debug" : "Debug Mode"}
        </Button>
      </Box>

      {}
      {debugMode && (
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" color="error">Debug Panel</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle1" gutterBottom>Debug Information:</Typography>
              {debugInfo && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Total Categories from Backend:</strong> {debugInfo.totalCount || 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Categories in State:</strong> {categories.length}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Filtered Categories:</strong> {filteredCategories.length}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Last Updated:</strong> {debugInfo.timestamp || 'N/A'}
                  </Typography>
                </Box>
              )}
              
              <Typography variant="subtitle1" gutterBottom>All Categories from Backend:</Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
                {debugInfo?.categories?.map((cat, index) => (
                  <Chip
                    key={index}
                    label={`${cat.name} (${cat.type})`}
                    color={cat.type === 'income' ? 'success' : 'error'}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>

              <Typography variant="subtitle1" gutterBottom>Create Missing Category:</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  label="Category Name"
                  value={createCategoryData.name}
                  onChange={(e) => setCreateCategoryData({...createCategoryData, name: e.target.value})}
                  placeholder="e.g., Tutioning Students"
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={createCategoryData.type}
                    label="Type"
                    onChange={(e) => setCreateCategoryData({...createCategoryData, type: e.target.value})}
                  >
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  type="color"
                  label="Color"
                  value={createCategoryData.color}
                  onChange={(e) => setCreateCategoryData({...createCategoryData, color: e.target.value})}
                  sx={{ width: 80 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleCreateDebugCategory}
                  disabled={!createCategoryData.name}
                >
                  Create
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '90vh', overflowY: 'auto', p: 2 }}>
        <Paper sx={{ minWidth: 0, boxShadow: 3, background: 'transparent', flex: 1, overflow: 'visible' }}>
          <TableContainer sx={{ background: 'transparent' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Transactions</TableCell>
                  <TableCell>Avg Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Box textAlign="center">
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                          {categories.length === 0 ? 'No categories found' : 'No categories match your filters'}
                        </Typography>
                        {categories.length === 0 && (
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Create your first category to get started with organizing your finances.
                          </Typography>
                        )}
                        {categories.length === 0 && (
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                          >
                            Create Your First Category
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => {
                    const stats = getCategoryStats(category.id);
                    return (
                      <TableRow key={category.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {}
                            {(() => {
                              switch (category.name.toLowerCase()) {
                                case 'college fees':
                                  return <School sx={{ mr: 2 }} color="primary" />;
                                case 'food':
                                  return <Fastfood sx={{ mr: 2 }} color="error" />;
                                case 'rent':
                                  return <Home sx={{ mr: 2 }} color="warning" />;
                                case 'small business':
                                  return <BusinessCenter sx={{ mr: 2 }} color="info" />;
                                case 'teaching':
                                  return <MenuBook sx={{ mr: 2 }} color="success" />;
                                case 'travel':
                                  return <Flight sx={{ mr: 2 }} color="primary" />;
                                default:
                                  return <Category sx={{ mr: 2 }} color="disabled" />;
                              }
                            })()}
                            <Typography variant="subtitle1" fontWeight="medium">
                              {category.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={category.type} 
                            color={category.type === 'income' ? 'success' : 'error'}
                            size="small"
                            icon={category.type === 'income' ? <TrendingUp /> : <TrendingDown />}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="h6"
                            color={category.type === 'income' ? 'success.main' : 'error.main'}
                          >
                            ${stats.totalAmount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {stats.transactionCount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            ${stats.avgAmount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {category.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(category)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(category.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Category Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              required
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
                {categoryTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center">
                      {type.icon}
                      <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="subtitle2" gutterBottom>
              Color
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1}>
                {colorOptions.map((color) => (
                  <Grid item key={color}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: color,
                        cursor: 'pointer',
                        border: formData.color === color ? '3px solid #000' : 'none',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          transition: 'transform 0.2s'
                        }
                      }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
            
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
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Categories; 