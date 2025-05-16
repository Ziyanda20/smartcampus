const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get announcements for the logged-in user or 'system' type
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const query = `
      SELECT n.*, u.full_name as sender_name 
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE (n.user_id = ? OR n.type = 'system')
      ORDER BY n.created_at DESC
    `;

    const [announcements] = await db.execute(query, [userId]);
    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch announcements', details: error.message });
  }
});

// Mark announcement as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    res.json({ success: true, message: 'Announcement marked as read' });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, error: 'Failed to update announcement', details: error.message });
  }
});

module.exports = router;
