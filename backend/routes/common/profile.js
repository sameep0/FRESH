const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

module.exports = (models, authenticateToken) => {
  const { User } = models;

  router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
    }
  });

  router.put('/profile', authenticateToken, async (req, res) => {
    try {
      const user = await models.User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const allowedFields = ['username', 'name', 'email', 'phone', 'location', 'bio'];
      const updateData = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) updateData[key] = req.body[key];
      }
      const oldEmail = user.email;
      const oldName = user.name;
      try {
        await user.update(updateData);
      } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({ message: 'Username or email already exists' });
        } else {
          throw err;
        }
      }
      let token = null;
      if ((updateData.email && updateData.email !== oldEmail) || (updateData.name && updateData.name !== oldName)) {
        token = jwt.sign(
          { id: user.id, username: user.username, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '2h' }
        );
      }
      res.json({ message: 'Profile updated', user, token });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update profile', error: err.message });
    }
  });

  router.post('/profile/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
      const user = await models.User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      await user.update({ avatar: avatarPath });
      res.json({ message: 'Avatar updated', avatar: avatarPath });
    } catch (err) {
      res.status(500).json({ message: 'Failed to upload avatar', error: err.message });
    }
  });

  return router;
}; 