const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

router.post('/register', async (req, res) => {
  try {
    const { fullName, username, email, password, role = 'student' } = req.body;

    // Validate input
    if (!fullName?.trim()) return res.status(400).json({ error: 'Full name is required' });
    if (!username?.trim()) return res.status(400).json({ error: 'Username is required' });
    if (!email?.trim()) return res.status(400).json({ error: 'Email is required' });
    if (!password) return res.status(400).json({ error: 'Password is required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const [emailRows] = await db.execute('SELECT 1 FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    const [usernameRows] = await db.execute('SELECT 1 FROM users WHERE username = ?', [username.trim().toLowerCase()]);

    if (emailRows.length > 0) return res.status(400).json({ error: 'Email already in use' });
    if (usernameRows.length > 0) return res.status(400).json({ error: 'Username already taken' });

    // Hash password and insert user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (full_name, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [
        fullName.trim(),
        username.trim().toLowerCase(),
        email.trim().toLowerCase(),
        hashedPassword,
        role.toLowerCase(),
      ]
    );

    const token = jwt.sign(
      {
        id: result.insertId,
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        role: role.toLowerCase(),
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ token, role: role.toLowerCase() });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    const [rows] = await db.execute(
      'SELECT id, username, full_name, email, password, role FROM users WHERE username = ?',
      [username.trim().toLowerCase()]
    );

    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});



module.exports = router;
