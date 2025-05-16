const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get announcements for the logged-in user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const query = `
      SELECT n.*, u.full_name as sender_name 
      FROM notifications n
      JOIN users u ON n.user_id = u.id
      WHERE n.user_id = ? OR n.type = 'system'
      ORDER BY n.created_at DESC
    `;
    
    const [announcements] = await db.execute(query, [userId]);
    console.log(`Fetched announcements for userId ${userId}:`, announcements); // Debug log
    res.json({ data: announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Mark announcement as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ?',
      [id]
    );
    
    res.json({ message: 'Announcement marked as read' });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

module.exports = router;