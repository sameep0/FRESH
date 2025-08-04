const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

module.exports = (models) => {
  const { User } = models;

  router.get('/register', (req, res) => {
    res.send(`
      <h2>Register</h2>
      <form method="POST" action="/api/register">
        <input name="email" placeholder="Email" required /> <br/>
        <input name="username" placeholder="Username" required /> <br/>
        <input name="password" type="password" placeholder="Password" required /> <br/>
        <input name="name" placeholder="Name" /> <br/>
        <button type="submit">Register</button>
      </form>
    `);
  });

  router.get('/login', (req, res) => {
    res.send(`
      <h2>Login</h2>
      <form method="POST" action="/api/login">
        <input name="identifier" placeholder="Username or Email" required /> <br/>
        <input name="password" type="password" placeholder="Password" required /> <br/>
        <button type="submit">Login</button>
      </form>
    `);
  });

  router.post('/register', async (req, res) => {
    const { email, username, password, name } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Email, username, and password required' });
    }
    try {
      const userCount = await User.count();
      const role = userCount === 0 ? 'admin' : 'user';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ email, username, password: hashedPassword, name, role });
      res.status(201).json({ message: 'User registered', user: { id: user.id, username: user.username, email: user.email, name: user.name, role: user.role } });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        res.status(409).json({ message: 'Email or username already exists' });
      } else {
        res.status(500).json({ message: 'Registration failed', error: err.message });
      }
    }
  });

  router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Username/email and password required' });
    }
    try {
      const user = await User.findOne({
        where: {
          [require('sequelize').Op.or]: [
            { username: identifier },
            { email: identifier }
          ]
        }
      });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '2h' });
      
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        if (user.role === 'admin') {
          return res.redirect('/admin/dashboard');
        } else {
          return res.redirect('/user/dashboard');
        }
      }
      
      res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username, email: user.email, name: user.name, role: user.role, avatar: user.avatar } });
    } catch (err) {
      res.status(500).json({ message: 'Login failed', error: err.message });
    }
  });

  return router;
}; 