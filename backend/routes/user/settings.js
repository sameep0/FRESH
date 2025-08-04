const express = require('express');
const router = express.Router();

module.exports = (models, authenticateToken) => {
  const { UserSettings } = models;

  router.get('/', authenticateToken, async (req, res) => {
    try {
      let settings = await UserSettings.findOne({ where: { UserId: req.user.id } });
      if (!settings) {
        settings = await UserSettings.create({ UserId: req.user.id });
      }
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch settings', error: err.message });
    }
  });

  router.put('/theme', authenticateToken, async (req, res) => {
    const { theme } = req.body;
    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).json({ message: 'Theme must be light or dark' });
    }
    try {
      let settings = await UserSettings.findOne({ where: { UserId: req.user.id } });
      if (!settings) settings = await UserSettings.create({ UserId: req.user.id });
      await settings.update({ theme });
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update theme', error: err.message });
    }
  });

  router.put('/notifications', authenticateToken, async (req, res) => {
    const { notifications } = req.body;
    if (typeof notifications !== 'boolean') {
      return res.status(400).json({ message: 'Notifications must be boolean' });
    }
    try {
      let settings = await UserSettings.findOne({ where: { UserId: req.user.id } });
      if (!settings) settings = await UserSettings.create({ UserId: req.user.id });
      await settings.update({ notifications });
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update notifications', error: err.message });
    }
  });

  router.put('/cloud', authenticateToken, async (req, res) => {
    const { cloudSync } = req.body;
    if (typeof cloudSync !== 'boolean') {
      return res.status(400).json({ message: 'cloudSync must be boolean' });
    }
    try {
      let settings = await UserSettings.findOne({ where: { UserId: req.user.id } });
      if (!settings) settings = await UserSettings.create({ UserId: req.user.id });
      await settings.update({ cloudSync });
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update cloud sync', error: err.message });
    }
  });

  router.put('/', authenticateToken, async (req, res) => {
    try {
      let settings = await UserSettings.findOne({ where: { UserId: req.user.id } });
      if (!settings) settings = await UserSettings.create({ UserId: req.user.id });
      
      const allowedFields = ['theme', 'notifications', 'cloudSync'];
      const updateData = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) updateData[key] = req.body[key];
      }
      await settings.update(updateData);
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update settings', error: err.message });
    }
  });

  
  router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const user = await models.User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
      if (!user) return res.status(404).json({ message: 'User not found' });
      let settings = await models.UserSettings.findOne({ where: { UserId: req.user.id } });
      if (!settings) settings = await models.UserSettings.create({ UserId: req.user.id });
      console.log('[DEBUG] Returning user.avatar:', user.avatar);
      res.json({ user, settings });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch profile and settings', error: err.message });
    }
  });

  return router;
}; 