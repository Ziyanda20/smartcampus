const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get notifications for the logged-in user
router.get('/', async (req, res) => {
  try {
    const { userId, is_read } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let query = `
      SELECT n.*, u.full_name as sender_name 
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE (n.user_id = ? OR n.type = 'system')
    `;
    const params = [userId];

    if (is_read !== undefined) {
      query += ` AND n.is_read = ?`;
      params.push(is_read);
    }

    query += ` ORDER BY n.created_at DESC`;

    const [notifications] = await db.execute(query, params);
    console.log(`Fetched notifications for userId ${userId}:`, notifications);
    res.json({ data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark announcement as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);

    res.json({ message: 'Announcement marked as read' });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

module.exports = router;