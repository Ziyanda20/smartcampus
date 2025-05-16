const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET bookings for a specific user
router.get('/:userId/bookings', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    // Fetch study room bookings
    let roomQuery = `
      SELECT 
        rb.*,
        r.name as room_name,
        r.building,
        'study-room' as type,
        rb.start_time,
        rb.end_time
      FROM room_bookings rb
      JOIN rooms r ON rb.room_id = r.id
      WHERE rb.user_id = ?
    `;
    const roomParams = [userId];

    if (status) {
      roomQuery += ` AND rb.status = ?`;
      roomParams.push(status);
    }

    const [roomBookings] = await db.query(roomQuery, roomParams);

    // Fetch consultation bookings (for students)
    let consultationQuery = `
      SELECT 
        la.*,
        CONCAT(l.first_name, ' ', l.last_name) as lecturer_name,
        'consultation' as type,
        TIME(la.appointment_time) as start_time,
        TIME(DATE_ADD(la.appointment_time, INTERVAL la.duration_minutes MINUTE)) as end_time
      FROM lecturer_appointments la
      JOIN lecturers l ON la.lecturer_id = l.id
      WHERE la.student_id = ?
    `;
    const consultationParams = [userId];

    if (status) {
      consultationQuery += ` AND la.status = ?`;
      consultationParams.push(status);
    }

    const [consultations] = await db.query(consultationQuery, consultationParams);

    const allBookings = [...roomBookings, ...consultations];
    res.json({ success: true, data: allBookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user bookings',
      details: error.message
    });
  }
});

module.exports = router;