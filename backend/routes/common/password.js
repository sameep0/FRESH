const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = express.Router();

module.exports = (models, authenticateToken) => {
  const { User } = models;
  
  const resetTokens = {};

  
  router.post('/request-reset', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const token = crypto.randomBytes(32).toString('hex');
      resetTokens[token] = { userId: user.id, expires: Date.now() + 1000 * 60 * 15 }; 
      
      console.log(`Password reset link: http://localhost:3001/api/reset-password/${token}`);
      res.json({ message: 'Password reset link sent (check console for demo)', token });
    } catch (err) {
      res.status(500).json({ message: 'Failed to request password reset', error: err.message });
    }
  });

  
  router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password required' });
    const data = resetTokens[token];
    if (!data || data.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    try {
      const user = await User.findByPk(data.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const hashed = await bcrypt.hash(password, 10);
      await user.update({ password: hashed });
      delete resetTokens[token];
      res.json({ message: 'Password reset successful' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to reset password', error: err.message });
    }
  });

  
  router.put('/', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password required' });
    }
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(401).json({ message: 'Current password is incorrect' });
      const hashed = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashed });
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update password', error: err.message });
    }
  });

  return router;
}; 