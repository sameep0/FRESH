const express = require('express');
const router = express.Router();

module.exports = (models, authenticateToken) => {
  const { Transaction, Account, Category, Budget, RecurringTransaction, UserSettings } = models;

  router.get('/backup', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const [transactions, accounts, categories, budgets, recurs, settings] = await Promise.all([
        Transaction.findAll({ where: { UserId: userId } }),
        Account.findAll({ where: { UserId: userId } }),
        Category.findAll({ where: { UserId: userId } }),
        Budget.findAll({ where: { UserId: userId } }),
        RecurringTransaction.findAll({ where: { UserId: userId } }),
        UserSettings.findOne({ where: { UserId: userId } })
      ]);
      res.json({ transactions, accounts, categories, budgets, recurs, settings });
    } catch (err) {
      res.status(500).json({ message: 'Failed to backup data', error: err.message });
    }
  });

  router.post('/restore', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { transactions, accounts, categories, budgets, recurs, settings } = req.body;
      
      res.json({ message: 'Restore simulated (implement real logic for production)' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to restore data', error: err.message });
    }
  });

  
  router.post('/sync', authenticateToken, async (req, res) => {
    
    res.json({ message: 'Cloud sync simulated (implement real integration for production)' });
  });

  return router;
}; 