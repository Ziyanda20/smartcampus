const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get upcoming classes for student
router.get('/upcoming', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = req.jwt.verify(token, process.env.JWT_SECRET);
    
    // Get student's classes
    const [classes] = await db.execute(`
      SELECT c.name AS title, 
             CONCAT(s.start_time, ' - ', s.end_time) AS time,
             r.name AS location,
             d.name AS day
      FROM student_classes sc
      JOIN classes c ON sc.class_id = c.id
      JOIN schedules s ON c.schedule_id = s.id
      JOIN days d ON s.day_id = d.id
      JOIN rooms r ON c.room_id = r.id
      WHERE sc.student_id = ?
      AND CONCAT(CURDATE(), ' ', s.end_time) > NOW()
      ORDER BY s.day_id, s.start_time
      LIMIT 5
    `, [decoded.id]);

    res.json(classes);
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

module.exports = router;