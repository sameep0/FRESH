const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

module.exports = (models, authenticateToken) => {
  const { RecurringTransaction, Transaction, Account, Category } = models;

  router.post('/', authenticateToken, async (req, res) => {
    const { amount, description, type, interval, nextDate, endDate, AccountId, CategoryId } = req.body;
    if (!amount || !type || !interval || !nextDate || !AccountId || !CategoryId) {
      return res.status(400).json({ message: 'Required fields: amount, type, interval, nextDate, AccountId, CategoryId' });
    }
    try {
      const recurring = await RecurringTransaction.create({
        amount, description, type, interval, nextDate, endDate, isActive: true,
        UserId: req.user.id, AccountId, CategoryId
      });
      res.status(201).json(recurring);
    } catch (err) {
      res.status(500).json({ message: 'Failed to create recurring transaction', error: err.message });
    }
  });

  router.get('/', authenticateToken, async (req, res) => {
    try {
      const recurs = await RecurringTransaction.findAll({
        where: { UserId: req.user.id },
        include: [{ model: Account }, { model: Category }],
        order: [['nextDate', 'ASC']]
      });
      res.json(recurs);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch recurring transactions', error: err.message });
    }
  });

  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const recur = await RecurringTransaction.findOne({ where: { id: req.params.id, UserId: req.user.id } });
      if (!recur) return res.status(404).json({ message: 'Recurring transaction not found' });
      await recur.update(req.body);
      res.json(recur);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update recurring transaction', error: err.message });
    }
  });

  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const recur = await RecurringTransaction.findOne({ where: { id: req.params.id, UserId: req.user.id } });
      if (!recur) return res.status(404).json({ message: 'Recurring transaction not found' });
      await recur.destroy();
      res.json({ message: 'Recurring transaction deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete recurring transaction', error: err.message });
    }
  });

  router.post('/generate', authenticateToken, async (req, res) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const recurs = await RecurringTransaction.findAll({
        where: {
          UserId: req.user.id,
          isActive: true,
          nextDate: { [Op.lte]: today }
        }
      });
      let generated = [];
      for (const recur of recurs) {
        
        const transaction = await Transaction.create({
          amount: recur.amount,
          date: recur.nextDate,
          description: recur.description,
          type: recur.type,
          AccountId: recur.AccountId,
          CategoryId: recur.CategoryId,
          UserId: recur.UserId
        });
        generated.push(transaction);
        
        let next = new Date(recur.nextDate);
        switch (recur.interval) {
          case 'daily': next.setDate(next.getDate() + 1); break;
          case 'weekly': next.setDate(next.getDate() + 7); break;
          case 'monthly': next.setMonth(next.getMonth() + 1); break;
          case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
        }
        
        if (recur.endDate && next > new Date(recur.endDate)) {
          await recur.update({ isActive: false });
        } else {
          await recur.update({ nextDate: next.toISOString().slice(0, 10) });
        }
      }
      res.json({ message: 'Generated transactions', count: generated.length, transactions: generated });
    } catch (err) {
      res.status(500).json({ message: 'Failed to generate recurring transactions', error: err.message });
    }
  });

  return router;
}; 