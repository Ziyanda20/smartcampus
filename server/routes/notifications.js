const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // Attach decoded user info to request object
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function authorizeLecturerOrAdmin(req, res, next) {
  if (req.user.role === 'admin') return next();
  if (req.user.role === 'lecturer' && req.user.id === parseInt(req.params.id)) return next();
  return res.status(403).json({ error: 'Access Denied' });
}

router.post(
  '/lecturers/:id/announcements',
  authenticateUser,
  authorizeLecturerOrAdmin,
  async (req, res) => {
    try {
      const lecturerId = parseInt(req.params.id);
      const { title, message } = req.body;

      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
      }

      // Insert into announcements table
      const [result] = await db.execute(
        `INSERT INTO announcements (lecturer_id, title, message, created_at) VALUES (?, ?, ?, NOW())`,
        [lecturerId, title, message]
      );

      res.json({ success: true, message: 'Announcement posted', announcementId: result.insertId });
    } catch (error) {
      console.error('Error posting announcement:', error);
      res.status(500).json({ error: 'Failed to post announcement' });
    }
  }
);

router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch user notifications
    const [notifications] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    let announcements = [];
    if (userRole === 'student') {
      // Get lecturer IDs for student's classes
      const [lecturerIdsRows] = await db.execute(
        `SELECT DISTINCT lc.lecturer_id 
         FROM student_classes sc
         JOIN classes c ON sc.class_id = c.id
         JOIN lecturer_classes lc ON c.id = lc.class_id
         WHERE sc.student_id = ?`,
        [userId]
      );
      const lecturerIds = lecturerIdsRows.map(row => row.lecturer_id);
      if (lecturerIds.length > 0) {
        const placeholders = lecturerIds.map(() => '?').join(',');
        const [announcementRows] = await db.execute(
          `SELECT a.id, a.title, a.message, a.created_at, l.first_name, l.last_name
           FROM announcements a
           JOIN lecturers l ON a.lecturer_id = l.id
           WHERE a.lecturer_id IN (${placeholders})
           ORDER BY a.created_at DESC`,
          lecturerIds
        );
        announcements = announcementRows;
      }
    } else if (userRole === 'lecturer') {
      // Lecturer sees their own announcements
      const [announcementRows] = await db.execute(
        `SELECT a.id, a.title, a.message, a.created_at
         FROM announcements a
         WHERE a.lecturer_id = ?
         ORDER BY a.created_at DESC`,
        [userId]
      );
      announcements = announcementRows;
    } else if (userRole === 'admin') {
      // Admin sees all announcements
      const [announcementRows] = await db.execute(
        `SELECT a.id, a.title, a.message, a.created_at, l.first_name, l.last_name
         FROM announcements a
         JOIN lecturers l ON a.lecturer_id = l.id
         ORDER BY a.created_at DESC`
      );
      announcements = announcementRows;
    }

    res.json({
      success: true,
      data: {
        notifications,
        announcements,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications and announcements:', error);
    res.status(500).json({ error: 'Failed to fetch notifications and announcements' });
  }
});

module.exports = router;
