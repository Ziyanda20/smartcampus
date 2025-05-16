const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all lecturers
router.get('/', async (req, res) => {
  try {
    const [lecturers] = await db.query(`
      SELECT 
        id, 
        CONCAT(first_name, ' ', last_name) AS name,
        email,
        employee_id,
        department_id
      FROM lecturers
    `);
    
    console.log('Fetched lecturers:', lecturers);
    res.json({ success: true, data: lecturers });
  } catch (error) {
    console.error('Error fetching lecturers:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql,
      code: error.code
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch lecturers',
      details: error.message 
    });
  }
});

// GET lecturer's schedule
router.get('/:lecturerId/schedule', async (req, res) => {
  try {
    const { lecturerId } = req.params;

    if (!lecturerId) {
      return res.status(400).json({ success: false, error: 'lecturerId is required' });
    }

    const [schedule] = await db.query(`
      SELECT 
        c.id,
        DAYNAME(c.day) as day,  -- Ensure day is in "Monday", "Friday", etc. format
        c.start_time,
        c.end_time,
        c.course_name
      FROM classes c
      WHERE c.lecturer_id = ?
    `, [lecturerId]);

    res.json({ success: true, data: schedule });
  } catch (error) {
    console.error('Error fetching lecturer schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lecturer schedule',
      details: error.message
    });
  }
});

module.exports = router;