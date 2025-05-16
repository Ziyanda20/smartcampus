const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateUser } = require('../middleware/auth');

// GET timetable (student ID comes from JWT)
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { id: studentId, role } = req.user;

    console.log(`User role: ${role}, Type: ${typeof role}`);

    if (role.toLowerCase() !== 'student') {
      return res.status(403).json({ error: 'Access denied - student account required' });
    }

    const query = `
      SELECT 
        cl.name AS class_name,
        d.name AS day,
        s.start_time,
        s.end_time,
        r.name AS room_name,
        r.building,
        CONCAT(l.first_name, ' ', l.last_name) AS lecturer_name
      FROM student_classes sc
      JOIN classes cl ON sc.class_id = cl.id
      JOIN schedules s ON cl.schedule_id = s.id
      JOIN days d ON s.day_id = d.id
      JOIN rooms r ON cl.room_id = r.id
      JOIN lecturers l ON cl.lecturer_id = l.id
      WHERE sc.student_id = ?
      ORDER BY FIELD(d.name, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), s.start_time
    `;

    const [timetable] = await db.execute(query, [studentId]);

    if (!timetable || timetable.length === 0) {
      return res.status(404).json({ data: [], message: 'No timetable found for this student' });
    }

    res.json({ data: timetable });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ error: 'Failed to fetch timetable', details: error.message });
  }
});

module.exports = router;
