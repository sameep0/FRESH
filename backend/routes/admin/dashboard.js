const express = require('express');
const router = express.Router();

module.exports = (models, authenticateToken, requireAdmin) => {
  const { User, Account, Transaction, Category } = models;

  router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const totalUsers = await User.count();
      const totalTransactions = await Transaction.count();
      const totalAccounts = await Account.count();
      const totalCategories = await Category.count({ where: { active: true } });
      const recentUsers = await User.findAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      res.json({ totalUsers, totalTransactions, totalAccounts, totalCategories, recentUsers });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch admin dashboard', error: err.message });
    }
  });

  router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        include: [
          { model: Account, as: 'Accounts' },
          { model: Transaction, as: 'Transactions' },
          { model: Category, as: 'Categories' }
        ]
      });
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch users', error: err.message });
    }
  });

  router.put('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Valid role required' });
    }
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      await user.update({ role });
      res.json({ message: 'User role updated', user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update user role', error: err.message });
    }
  });

  router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (user.id === req.user.id) return res.status(400).json({ message: 'Cannot delete yourself' });
      await user.destroy();
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete user', error: err.message });
    }
  });

  return router;
}; 