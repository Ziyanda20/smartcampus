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

    const userId = result.insertId;

    // Assign exactly 3 random distinct class_ids
    const [classes] = await db.execute('SELECT id FROM classes WHERE id IN (1, 2, 3, 4, 46, 47, 48, 49, 50)');
    if (classes.length < 3) {
      return res.status(500).json({ error: 'Not enough classes available to assign (minimum 3 required)' });
    }

    // Shuffle the classes array and pick the first 3
    const shuffledClasses = classes.sort(() => Math.random() - 0.5);
    const assignedClassIds = shuffledClasses.slice(0, 3).map(classRow => classRow.id);

    // Insert the 3 class assignments into student_classes
    for (const classId of assignedClassIds) {
      await db.execute(
        'INSERT INTO student_classes (student_id, class_id) VALUES (?, ?)',
        [userId, classId]
      );
    }

    const token = jwt.sign(
      {
        id: userId,
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        role: role.toLowerCase(),
        class_ids: assignedClassIds, // Include all assigned class_ids in the token
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ token, role: role.toLowerCase(), class_ids: assignedClassIds });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.', details: error.message });
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

    // Fetch all class_ids for the user
    const [classRows] = await db.execute(
      'SELECT class_id FROM student_classes WHERE student_id = ?',
      [user.id]
    );
    const class_ids = classRows.map(row => row.class_id);

    if (class_ids.length === 0) {
      // If no classes assigned, assign 3 random classes
      const [classes] = await db.execute('SELECT id FROM classes WHERE id IN (1, 2, 3, 4, 46, 47, 48, 49, 50)');
      if (classes.length < 3) {
        return res.status(500).json({ error: 'Not enough classes available to assign (minimum 3 required)' });
      }
      const shuffledClasses = classes.sort(() => Math.random() - 0.5);
      const assignedClassIds = shuffledClasses.slice(0, 3).map(classRow => classRow.id);

      for (const classId of assignedClassIds) {
        await db.execute(
          'INSERT INTO student_classes (student_id, class_id) VALUES (?, ?)',
          [user.id, classId]
        );
      }
      class_ids.push(...assignedClassIds);
    }

    const token = jwt.sign(
      {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
        class_ids: class_ids, // Return all class_ids
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role, class_ids });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

module.exports = router;