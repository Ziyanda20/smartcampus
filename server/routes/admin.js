const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');

// GET Dashboard Overview Stats (for AnalyticsPage)
router.get('/dashboard-stats', authenticateAdmin, async (req, res) => {
  try {
    const [bookings] = await db.query('SELECT status, COUNT(*) as count FROM room_bookings GROUP BY status');
    const bookingsByStatus = bookings.reduce((acc, booking) => {
      acc[booking.status] = booking.count;
      return acc;
    }, { confirmed: 0, pending: 0, rejected: 0 });

    const [maintenance] = await db.query('SELECT COUNT(*) as count FROM maintenance_requests WHERE status = \'pending\'');
    const pendingMaintenance = maintenance[0].count || 0;

    res.json({ success: true, data: { bookingsByStatus, pendingMaintenance } });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats', details: error.message });
  }
});

// GET All Bookings (for BookingsManagement)
router.get('/bookings', authenticateAdmin, async (req, res) => {
  try {
    const [roomBookings] = await db.query(`
      SELECT rb.id, rb.room_id, r.name as room_name, rb.purpose, rb.status, rb.booking_date as date,
      CONCAT(u.full_name, ' - ', CASE WHEN u.role = 'student' THEN 'Student' WHEN u.role = 'lecturer' THEN 'Lecturer' ELSE 'Admin' END) as requested_by
      FROM room_bookings rb
      JOIN rooms r ON rb.room_id = r.id
      JOIN users u ON rb.user_id = u.id
    `);

    const [consultations] = await db.query(`
      SELECT la.id, la.lecturer_id as room_id, CONCAT('Consultation with ', l.first_name, ' ', l.last_name) as room_name,
      la.purpose, la.status, DATE(la.appointment_time) as date, CONCAT(u.full_name, ' - Student') as requested_by
      FROM lecturer_appointments la
      JOIN users u ON la.student_id = u.id
      JOIN lecturers l ON la.lecturer_id = l.id
    `);

    const allBookings = [...roomBookings, ...consultations];
    res.json({ success: true, data: allBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings', details: error.message });
  }
});

// Update Booking Status (for BookingsManagement)
router.patch('/bookings/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, type } = req.body;

    if (!status || !type) {
      return res.status(400).json({ success: false, error: 'Status and type are required' });
    }

    let table, userIdField;
    if (type === 'study-room') { table = 'room_bookings'; userIdField = 'user_id'; }
    else if (type === 'consultation') { table = 'lecturer_appointments'; userIdField = 'student_id'; }
    else return res.status(400).json({ success: false, error: 'Invalid type. Must be study-room or consultation' });

    const [result] = await db.query(`UPDATE ${table} SET status = ?, modified_at = NOW() WHERE id = ?`, [status, id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Booking not found' });

    const [record] = await db.query(`SELECT ${userIdField} as user_id FROM ${table} WHERE id = ?`, [id]);
    const userId = record[0].user_id;

    const notificationType = type === 'study-room' ? 'study-room' : 'consultation';
    const message = `Your ${notificationType} booking (ID: ${id}) has been ${status}.`;

    const [existingNotification] = await db.query(`SELECT id FROM notifications WHERE related_id = ? AND type = ?`, [id, notificationType]);
    if (existingNotification.length > 0) {
      await db.query(`UPDATE notifications SET message = ?, is_read = 0, created_at = NOW() WHERE id = ?`, [message, existingNotification[0].id]);
    } else {
      await db.query(`INSERT INTO notifications (user_id, title, message, is_read, created_at, type, related_id) VALUES (?, ?, ?, 0, NOW(), ?, ?)`,
        [userId, `${notificationType} ${status}`, message, notificationType, id]);
    }

    res.json({ success: true, message: `Booking status updated to ${status}` });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, error: 'Failed to update booking status', details: error.message });
  }
});

// GET All Maintenance Requests (for MaintenanceManagement)
router.get('/maintenance', authenticateAdmin, async (req, res) => {
  try {
    const [requests] = await db.query(`
      SELECT mr.id, CONCAT(r.name, ' - ', r.building) as location, mr.description as issue,
      mr.created_at as date_reported, mr.status, CONCAT(u.full_name, ' - ',
      CASE WHEN u.role = 'student' THEN 'Student' WHEN u.role = 'lecturer' THEN 'Lecturer' ELSE 'Admin' END) as requested_by
      FROM maintenance_requests mr
      JOIN rooms r ON mr.room_id = r.id
      JOIN users u ON mr.user_id = u.id
    `);
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch maintenance requests', details: error.message });
  }
});

// Update Maintenance Request Status (for MaintenanceManagement)
router.patch('/maintenance/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ success: false, error: 'Status is required' });

    const [result] = await db.query(`UPDATE maintenance_requests SET status = ?, updated_at = NOW() WHERE id = ?`, [status, id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Maintenance request not found' });

    const [request] = await db.query(`SELECT user_id FROM maintenance_requests WHERE id = ?`, [id]);
    const userId = request[0].user_id;

    const message = `Your maintenance request (ID: ${id}) has been ${status}.`;
    const [existingNotification] = await db.query(`SELECT id FROM notifications WHERE related_id = ? AND type = 'maintenance'`, [id]);
    if (existingNotification.length > 0) {
      await db.query(`UPDATE notifications SET message = ?, is_read = 0, created_at = NOW() WHERE id = ?`, [message, existingNotification[0].id]);
    } else {
      await db.query(`INSERT INTO notifications (user_id, title, message, is_read, created_at, type, related_id) VALUES (?, ?, ?, 0, NOW(), ?, ?)`,
        [userId, `Maintenance ${status}`, message, 'maintenance', id]);
    }

    res.json({ success: true, message: `Maintenance request status updated to ${status}` });
  } catch (error) {
    console.error('Error updating maintenance request status:', error);
    res.status(500).json({ success: false, error: 'Failed to update maintenance request status', details: error.message });
  }
});

// GET All Timetable Entries (for TimetableManagement)
router.get('/timetable', authenticateAdmin, async (req, res) => {
  try {
    const [timetable] = await db.query(`
      SELECT c.id, d.name AS day, CONCAT(s.start_time, ' - ', s.end_time) AS time,
      c.name AS module, r.name AS venue, CONCAT(l.first_name, ' ', l.last_name) AS lecturer
      FROM classes c
      JOIN schedules s ON c.schedule_id = s.id
      JOIN days d ON s.day_id = d.id
      JOIN rooms r ON c.room_id = r.id
      JOIN lecturers l ON c.lecturer_id = l.id
      ORDER BY FIELD(d.name, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), s.start_time
    `);
    res.json({ success: true, data: timetable });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch timetable', details: error.message });
  }
});

// POST New Timetable Entry (for TimetableManagement)
router.post('/timetable', authenticateAdmin, async (req, res) => {
  try {
    const { day, time, module, venue, lecturer } = req.body;

    if (!day || !time || !module || !venue || !lecturer) {
      return res.status(400).json({ success: false, error: 'All fields (day, time, module, venue, lecturer) are required' });
    }

    const timeRegex = /^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/;
    if (!timeRegex.test(time)) {
      return res.status(400).json({ success: false, error: 'Time must be in the format "HH:MM - HH:MM"' });
    }
    const [start_time, end_time] = time.split(' - ').map(t => t.trim() + ':00');
    const timeFormatRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timeFormatRegex.test(start_time) || !timeFormatRegex.test(end_time)) {
      return res.status(400).json({ success: false, error: 'Start and end times must be valid (e.g., "09:00", "14:30")' });
    }

    const [dayRow] = await db.query('SELECT id FROM days WHERE name = ?', [day]);
    if (dayRow.length === 0) return res.status(404).json({ success: false, error: `Day "${day}" not found` });
    const day_id = dayRow[0].id;

    const [room] = await db.query('SELECT id FROM rooms WHERE name = ?', [venue]);
    if (room.length === 0) return res.status(404).json({ success: false, error: `Room "${venue}" not found` });
    const room_id = room[0].id;

    const [lecturerData] = await db.query('SELECT id FROM lecturers WHERE CONCAT(first_name, " ", last_name) = ?', [lecturer]);
    if (lecturerData.length === 0) return res.status(404).json({ success: false, error: `Lecturer "${lecturer}" not found` });
    const lecturer_id = lecturerData[0].id;

    const [scheduleResult] = await db.query('INSERT INTO schedules (day_id, start_time, end_time) VALUES (?, ?, ?)', [day_id, start_time, end_time]);
    const schedule_id = scheduleResult.insertId;

    const [classResult] = await db.query('INSERT INTO classes (name, schedule_id, room_id, lecturer_id) VALUES (?, ?, ?, ?)', [module, schedule_id, room_id, lecturer_id]);

    res.status(201).json({ success: true, message: 'Timetable entry added successfully', id: classResult.insertId });
  } catch (error) {
    console.error('Error adding timetable entry:', error);
    res.status(500).json({ success: false, error: 'Failed to add timetable entry', details: error.message });
  }
});

// GET All Rooms (for TimetableManagement dropdown)
router.get('/rooms', authenticateAdmin, async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT id, name FROM rooms');
    if (rooms.length === 0) return res.json({ success: true, data: [], message: 'No rooms available' });
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch rooms', details: error.message });
  }
});

// GET All Lecturers (for TimetableManagement dropdown)
router.get('/lecturers', authenticateAdmin, async (req, res) => {
  try {
    const [lecturers] = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM lecturers');
    if (lecturers.length === 0) return res.json({ success: true, data: [], message: 'No lecturers available' });
    res.json({ success: true, data: lecturers });
  } catch (error) {
    console.error('Error fetching lecturers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch lecturers', details: error.message });
  }
});

module.exports = router;