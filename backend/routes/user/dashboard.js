const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

module.exports = (models, authenticateToken) => {
  const { Account, Transaction, Category, Budget } = models;

  router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const accounts = await Account.findAll({ where: { UserId: userId, active: true } });
      const recentTransactions = await Transaction.findAll({
        where: { UserId: userId },
        include: [{ model: Account }, { model: Category }],
        order: [['date', 'DESC']],
        limit: 5
      });
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyTransactions = await Transaction.findAll({
        where: { UserId: userId, date: { [Op.like]: `${currentMonth}%` } }
      });
      const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const monthlyExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const budgets = await Budget.findAll({ where: { UserId: userId, month: currentMonth }, include: [{ model: Category }] });
      const budgetProgress = budgets.map(budget => {
        const categoryTransactions = monthlyTransactions.filter(t => t.CategoryId === budget.CategoryId);
        const spent = categoryTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return {
          category: budget.Category.name,
          budget: parseFloat(budget.amount),
          spent,
          remaining: parseFloat(budget.amount) - spent,
          percentage: (spent / parseFloat(budget.amount)) * 100
        };
      });
      const dashboard = {
        accounts,
        recentTransactions,
        monthlySummary: {
          income: monthlyIncome,
          expense: monthlyExpense,
          netIncome: monthlyIncome - monthlyExpense
        },
        budgetProgress,
        quickStats: {
          totalAccounts: accounts.length,
          totalTransactions: await Transaction.count({ where: { UserId: userId } }),
          totalCategories: await Category.count({ where: { UserId: userId } })
        }
      };
      res.json(dashboard);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch user dashboard', error: err.message });
    }
  });

  router.get('/summary', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { period = 'month' } = req.query;
      let dateFilter = {};
      const now = new Date();
      switch(period) {
        case 'month':
          dateFilter = { [Op.like]: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}%` };
          break;
        case 'quarter':
          const quarter = Math.ceil((now.getMonth() + 1) / 3);
          const quarterStart = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
          const quarterEnd = new Date(now.getFullYear(), quarter * 3, 0);
          dateFilter = { [Op.between]: [quarterStart, quarterEnd] };
          break;
        case 'year':
          dateFilter = { [Op.like]: `${now.getFullYear()}%` };
          break;
      }
      const transactions = await Transaction.findAll({ where: { UserId: userId, date: dateFilter }, include: [{ model: Category }] });
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
      res.json({ period, totalIncome, totalExpense, netIncome: totalIncome - totalExpense, incomeByCategory, expenseByCategory, transactionCount: transactions.length });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch summary', error: err.message });
    }
  });

  return router;
}; 