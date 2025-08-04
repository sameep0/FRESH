require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const adminDashboardRouter = require('./routes/admin/dashboard');
const userDashboardRouter = require('./routes/user/dashboard');
const authRouter = require('./routes/common/auth');
const profileRouter = require('./routes/common/profile');
const recurringRouter = require('./routes/user/recurring');
const settingsRouter = require('./routes/user/settings');
const passwordRouter = require('./routes/common/password');
const exportRouter = require('./routes/user/export');
const cloudRouter = require('./routes/user/cloud');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const sequelize = new Sequelize(
  process.env.DB_NAME || 'testdb',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
  }
);

const models = require('./models')(sequelize);
const { User, Account, Category, Transaction, Budget } = models;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

app.get('/user/dashboard', (req, res) => {
  res.send(`
    <h2>User Dashboard</h2>
    <p>Welcome! You are logged in as a user.</p>
    <a href="/api/login">Logout</a>
  `);
});

app.get('/admin/dashboard', (req, res) => {
  res.send(`
    <h2>Admin Dashboard</h2>
    <p>Welcome! You are logged in as an admin.</p>
    <a href="/api/login">Logout</a>
  `);
});

app.use('/admin', adminDashboardRouter(models, authenticateToken, requireAdmin));
app.use('/user', userDashboardRouter(models, authenticateToken));
app.use('/user/recurring', recurringRouter(models, authenticateToken));
app.use('/user/settings', settingsRouter(models, authenticateToken));
app.use('/user/export', exportRouter(models, authenticateToken));
app.use('/user/cloud', cloudRouter(models, authenticateToken));
app.use('/api', authRouter(models));
app.use('/api', profileRouter(models, authenticateToken));
app.use('/api/password', passwordRouter(models, authenticateToken));

app.get('/user/accounts', authenticateToken, async (req, res) => {
  try {
    console.log(`[GET /user/accounts] User: ${req.user.id}`);
    const accounts = await Account.findAll({ where: { UserId: req.user.id, active: true } });
    console.log(`[GET /user/accounts] Found ${accounts.length} accounts`);
    res.json(accounts);
  } catch (err) {
    console.error('[GET /user/accounts] Error:', err);
    res.status(500).json({ message: 'Failed to fetch accounts', error: err.message });
  }
});

app.post('/user/accounts', authenticateToken, async (req, res) => {
  const { name, type, balance, currency, description } = req.body;
  if (!name || !type || balance === undefined) {
    return res.status(400).json({ message: 'Name, type, and balance are required' });
  }
  try {
    console.log(`[POST /user/accounts] Creating account for User: ${req.user.id}`);
    const account = await Account.create({
      name,
      type,
      balance,
      currency: currency || 'USD',
      description,
      UserId: req.user.id
    });
    console.log(`[POST /user/accounts] Created account ID: ${account.id}`);
    res.status(201).json(account);
  } catch (err) {
    console.error('[POST /user/accounts] Error:', err);
    res.status(500).json({ message: 'Failed to create account', error: err.message });
  }
});

app.put('/user/accounts/:id', authenticateToken, async (req, res) => {
  const { name, type, balance, currency, description } = req.body;
  try {
    console.log(`[PUT /user/accounts/${req.params.id}] User: ${req.user.id}`);
    const account = await Account.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    await account.update({ name, type, balance, currency, description });
    console.log(`[PUT /user/accounts/${req.params.id}] Updated account`);
    res.json(account);
  } catch (err) {
    console.error(`[PUT /user/accounts/${req.params.id}] Error:`, err);
    res.status(500).json({ message: 'Failed to update account', error: err.message });
  }
});

app.delete('/user/accounts/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`[DELETE /user/accounts/${req.params.id}] User: ${req.user.id}`);
    const account = await Account.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    await account.destroy();
    console.log(`[DELETE /user/accounts/${req.params.id}] Deleted account`);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(`[DELETE /user/accounts/${req.params.id}] Error:`, err);
    res.status(500).json({ message: 'Failed to delete account', error: err.message });
  }
});

app.get('/user/categories', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const categories = await Category.findAll({ where: { UserId: userId }, order: [['name', 'ASC']] });
    console.log(`[Category Fetch] User ${userId} fetched ${categories.length} categories.`);
    res.json(categories);
  } catch (err) {
    console.error('[Category Fetch Error]', err);
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
});

app.post('/user/categories', authenticateToken, async (req, res) => {
  const { name, type, color, description } = req.body;
  if (!name || !type) {
    return res.status(400).json({ message: 'Name and type are required' });
  }
  try {
    const userId = req.user.id;
    const existingCategory = await Category.findOne({ where: { name, UserId: userId } });
    if (existingCategory) {
      return res.status(409).json({ message: 'Category with this name already exists' });
    }
    const category = await Category.create({
      name,
      type,
      color: color || '#1976d2',
      description,
      UserId: userId
    });
    console.log(`[Category Create] User ${userId} created category '${name}' (ID: ${category.id})`);
    res.status(201).json(category);
  } catch (err) {
    console.error('[Category Create Error]', err);
    res.status(500).json({ message: 'Failed to create category', error: err.message });
  }
});

app.get('/admin/all-categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['UserId', 'ASC'], ['name', 'ASC']] });
    res.json({ total: categories.length, categories });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all categories', error: err.message });
  }
});

app.put('/user/categories/:id', authenticateToken, async (req, res) => {
  const { name, type, color, description } = req.body;
  try {
    const category = await Category.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: { 
          name: name,
          UserId: req.user.id,
          id: { [Sequelize.Op.ne]: req.params.id }
        }
      });

      if (existingCategory) {
        return res.status(400).json({ message: 'A category with this name already exists' });
      }
    }
    
    await category.update({ 
      name: name || category.name, 
      type: type || category.type, 
      color: color || category.color, 
      description: description !== undefined ? description : category.description 
    });
    res.json(category);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ message: 'Failed to update category', error: err.message });
  }
});

app.delete('/user/categories/:id', authenticateToken, async (req, res) => {
  try {
    const category = await Category.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category', error: err.message });
  }
});

app.get('/user/budgets', authenticateToken, async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Category }]
    });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch budgets', error: err.message });
  }
});

app.post('/user/budgets', authenticateToken, async (req, res) => {
  const { categoryId, amount, period, startDate, description } = req.body;
  if (!categoryId || !amount || !period) {
    return res.status(400).json({ message: 'Category, amount, and period are required' });
  }
  try {
    const budget = await Budget.create({
      categoryId,
      amount,
      period,
      startDate: startDate || new Date(),
      description,
      UserId: req.user.id
    });
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create budget', error: err.message });
  }
});

app.put('/user/budgets/:id', authenticateToken, async (req, res) => {
  const { categoryId, amount, period, startDate, description } = req.body;
  try {
    const budget = await Budget.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    await budget.update({ categoryId, amount, period, startDate, description });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update budget', error: err.message });
  }
});

app.delete('/user/budgets/:id', authenticateToken, async (req, res) => {
  try {
    const budget = await Budget.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    await budget.destroy();
    res.json({ message: 'Budget deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete budget', error: err.message });
  }
});

app.get('/user/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Account }, { model: Category }],
      order: [['date', 'DESC']]
    });
    
    const transformedTransactions = transactions.map(transaction => ({
      ...transaction.toJSON(),
      categoryId: transaction.CategoryId,
      accountId: transaction.AccountId
    }));
    
    res.json(transformedTransactions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: err.message });
  }
});

app.post('/user/transactions', authenticateToken, async (req, res) => {
  const { description, amount, type, categoryId, accountId, date, notes } = req.body;
  if (!description || !amount || !type || !date) {
    return res.status(400).json({ message: 'Description, amount, type, and date are required' });
  }
  try {
    const transaction = await Transaction.create({
      description,
      amount,
      type,
      CategoryId: categoryId || null,
      AccountId: accountId || null,
      date,
      notes,
      UserId: req.user.id
    });
    
    const transformedTransaction = {
      ...transaction.toJSON(),
      categoryId: transaction.CategoryId,
      accountId: transaction.AccountId
    };
    
    res.status(201).json(transformedTransaction);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create transaction', error: err.message });
  }
});

app.put('/user/transactions/:id', authenticateToken, async (req, res) => {
  const { description, amount, type, categoryId, accountId, date, notes } = req.body;
  try {
    const transaction = await Transaction.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    await transaction.update({ 
      description, 
      amount, 
      type, 
      CategoryId: categoryId || null, 
      AccountId: accountId || null, 
      date, 
      notes 
    });
    
    const transformedTransaction = {
      ...transaction.toJSON(),
      categoryId: transaction.CategoryId,
      accountId: transaction.AccountId
    };
    
    res.json(transformedTransaction);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update transaction', error: err.message });
  }
});

app.delete('/user/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    await transaction.destroy();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete transaction', error: err.message });
  }
});

app.get('/reports', authenticateToken, async (req, res) => {
  try {
    const { month } = req.query;
    const whereClause = { UserId: req.user.id };
    if (month) {
      whereClause.date = { [Sequelize.Op.like]: `${month}%` };
    }

    const transactions = await Transaction.findAll({
      where: whereClause,
      include: [{ model: Category }, { model: Account }]
    });

    const accounts = await Account.findAll({ where: { UserId: req.user.id } });
    const categories = await Category.findAll({ where: { UserId: req.user.id } });

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const categorySummary = {};
    categories.forEach(cat => {
      const catTransactions = transactions.filter(t => t.CategoryId === cat.id);
      categorySummary[cat.name] = catTransactions.reduce((sum, t) => {
        return sum + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount));
      }, 0);
    });

    res.json({
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense,
      categorySummary,
      accountCount: accounts.length,
      transactionCount: transactions.length,
      transactions: transactions.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate report', error: err.message });
  }
});

app.get('/user/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch(period) {
      case 'month':
        dateFilter = { [Sequelize.Op.like]: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}%` };
        break;
      case 'quarter':
        const quarter = Math.ceil((now.getMonth() + 1) / 3);
        const quarterStart = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
        const quarterEnd = new Date(now.getFullYear(), quarter * 3, 0);
        dateFilter = { [Sequelize.Op.between]: [quarterStart, quarterEnd] };
        break;
      case 'year':
        dateFilter = { [Sequelize.Op.like]: `${now.getFullYear()}%` };
        break;
    }
    
    const transactions = await Transaction.findAll({
      where: { 
        UserId: userId,
        date: dateFilter
      },
      include: [{ model: Category }]
    });
    
    const incomeByCategory = {};
    const expenseByCategory = {};
    
    transactions.forEach(t => {
      const categoryName = t.Category.name;
      const amount = parseFloat(t.amount);
      
      if (t.type === 'income') {
        incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + amount;
      } else {
        expenseByCategory[categoryName] = (expenseByCategory[categoryName] || 0) + amount;
      }
    });
    
    const totalIncome = Object.values(incomeByCategory).reduce((sum, val) => sum + val, 0);
    const totalExpense = Object.values(expenseByCategory).reduce((sum, val) => sum + val, 0);
    
    res.json({
      period,
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense,
      incomeByCategory,
      expenseByCategory,
      transactionCount: transactions.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch summary', error: err.message });
  }
});

app.get('/debug/dbinfo', (req, res) => {
  const config = sequelize.config;
  res.json({
    database: config.database,
    username: config.username,
    host: config.host,
    dialect: config.dialect
  });
});

app.get('/debug/categories/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const categories = await Category.findAll({ 
      where: { UserId: userId },
      raw: true
    });
    
    res.json({
      userId,
      totalCategories: categories.length,
      categories: categories
    });
  } catch (err) {
    console.error('Debug categories error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/debug/all-categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const allCategories = await Category.findAll({
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }],
      order: [['UserId', 'ASC'], ['name', 'ASC']]
    });
    
    res.json({
      totalCategories: allCategories.length,
      categories: allCategories
    });
  } catch (err) {
    console.error('Debug all categories error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/debug/create-category', authenticateToken, async (req, res) => {
  try {
    const { name, type, color, description } = req.body;
    const userId = req.user.id;
    
    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }
    
    const existing = await Category.findOne({
      where: { name, UserId: userId }
    });
    
    if (existing) {
      return res.status(400).json({ 
        message: 'Category already exists',
        existingCategory: existing
      });
    }
    
    const category = await Category.create({
      name,
      type,
      color: color || '#1976d2',
      description: description || '',
      UserId: userId
    });
    
    console.log(`[Debug] Created category: ${name} for user ${userId}`);
    res.status(201).json({
      message: 'Category created successfully',
      category: category
    });
  } catch (err) {
    console.error('Debug create category error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
}); 