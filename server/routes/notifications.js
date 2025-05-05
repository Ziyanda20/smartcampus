const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = req.jwt.verify(token, process.env.JWT_SECRET);
    
    const [notifications] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [decoded.id]
    );
    
    res.json(notifications);
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;