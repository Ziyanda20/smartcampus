const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all bookings for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const [roomBookings] = await db.query(`
      SELECT 
        rb.*,
        r.name as room_name,
        r.building,
        'study-room' as type,
        rb.start_time,
        rb.end_time,
        rb.booking_date
      FROM room_bookings rb
      JOIN rooms r ON rb.room_id = r.id
      WHERE rb.user_id = ?
    `, [userId]);

    const [consultations] = await db.query(`
      SELECT 
        la.*,
        CONCAT(l.first_name, ' ', l.last_name) as lecturer_name,
        'consultation' as type,
        TIME(la.appointment_time) as start_time,
        TIME(DATE_ADD(la.appointment_time, INTERVAL la.duration_minutes MINUTE)) as end_time,
        DATE(la.appointment_time) as booking_date
      FROM lecturer_appointments la
      JOIN lecturers l ON la.lecturer_id = l.id
      WHERE la.student_id = ?
    `, [userId]);

    const allBookings = [...roomBookings, ...consultations];
    res.json({ success: true, data: allBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
      details: error.message
    });
  }
});

// POST route to create a new booking/maintenance request and notification
router.post('/', async (req, res) => {
  try {
    const { userId, type, roomId, lecturerId, bookingDate, startTime, endTime, purpose, description } = req.body;

    if (!userId || !purpose) {
      return res.status(400).json({ 
        success: false,
        error: 'userId and purpose are required' 
      });
    }

    let bookingId;
    if (type === 'study-room') {
      if (!roomId || !bookingDate || !startTime || !endTime) {
        return res.status(400).json({ 
          success: false,
          error: 'roomId, bookingDate, startTime, and endTime are required for study room booking' 
        });
      }

      const [conflicts] = await db.query(
        `SELECT id FROM room_bookings 
         WHERE room_id = ? AND booking_date = ? AND status != 'cancelled'
         AND (
           (start_time < ? AND end_time > ?) OR
           (start_time >= ? AND start_time < ?) OR
           (end_time > ? AND end_time <= ?)
         )`,
        [roomId, bookingDate, endTime, startTime, startTime, endTime, startTime, endTime]
      );

      if (conflicts.length > 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Room is already booked for the selected time' 
        });
      }

      const [result] = await db.query(
        `INSERT INTO room_bookings 
         (user_id, room_id, booking_date, start_time, end_time, purpose, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [userId, roomId, bookingDate, startTime, endTime, purpose]
      );
      bookingId = result.insertId;

      // Create notification for study-room booking
      await db.query(
        `INSERT INTO notifications (user_id, title, message, is_read, created_at, type, related_id) 
         VALUES (?, ?, ?, 0, NOW(), ?, ?)`,
        [
          userId,
          'Study Room Booking Request Submitted',
          `Your study room booking (ID: ${bookingId}) has been created. Purpose: ${purpose}`,
          'study-room',
          bookingId
        ]
      );
    } else if (type === 'consultation') {
      if (!lecturerId || !bookingDate || !startTime || !endTime) {
        return res.status(400).json({ 
          success: false,
          error: 'lecturerId, bookingDate, startTime, and endTime are required for consultation' 
        });
      }

      const appointmentTime = `${bookingDate} ${startTime}`;
      const [conflicts] = await db.query(
        `SELECT id FROM lecturer_appointments 
         WHERE lecturer_id = ? AND appointment_time = ? AND status != 'cancelled'`,
        [lecturerId, appointmentTime]
      );

      if (conflicts.length > 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Lecturer is already booked for the selected time' 
        });
      }

      const start = new Date(`${bookingDate}T${startTime}`);
      const end = new Date(`${bookingDate}T${endTime}`);
      const durationMinutes = (end - start) / (1000 * 60);

      if (durationMinutes <= 0) {
        return res.status(400).json({ 
          success: false,
          error: 'End time must be after start time' 
        });
      }

      const [classes] = await db.query(
        `SELECT id FROM classes WHERE lecturer_id = ? LIMIT 1`,
        [lecturerId]
      );
      const classId = classes.length > 0 ? classes[0].id : null;

      const [result] = await db.query(
        `INSERT INTO lecturer_appointments 
         (lecturer_id, student_id, appointment_time, duration_minutes, purpose, status, class_id, created_at) 
         VALUES (?, ?, ?, ?, ?, 'pending', ?, NOW())`,
        [lecturerId, userId, appointmentTime, durationMinutes, purpose, classId]
      );
      bookingId = result.insertId;

      // No notification for consultation
    } else if (type === 'maintenance') {
      if (!roomId || !description) {
        return res.status(400).json({ 
          success: false,
          error: 'roomId and description are required for maintenance request' 
        });
      }

      const [result] = await db.query(
        `INSERT INTO maintenance_requests 
         (room_id, user_id, description, status, created_at, updated_at) 
         VALUES (?, ?, ?, 'pending', NOW(), NOW())`,
        [roomId, userId, description]
      );
      bookingId = result.insertId;

      // Create notification for maintenance request
      await db.query(
        `INSERT INTO notifications (user_id, title, message, is_read, created_at, type, related_id) 
         VALUES (?, ?, ?, 0, NOW(), ?, ?)`,
        [
          userId,
          'Maintenance Request Submitted',
          `Your maintenance request (ID: ${bookingId}) for room ${roomId} has been submitted. Description: ${description}`,
          'maintenance',
          bookingId
        ]
      );
    } else {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid type. Use study-room, consultation, or maintenance' 
      });
    }

    return res.status(201).json({ 
      success: true,
      message: `${type === 'study-room' ? 'Room' : type === 'consultation' ? 'Consultation' : 'Maintenance'} request created successfully`, 
      bookingId
    });
  } catch (error) {
    console.error('Error creating booking/maintenance:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create booking/maintenance',
      details: error.message
    });
  }
});

// Update status and create/update notification
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, type } = req.body;

    if (!id || !status || !type) {
      return res.status(400).json({ 
        success: false,
        error: 'Booking ID, status, and type are required' 
      });
    }

    let table, userIdField;
    if (type === 'study-room') {
      table = 'room_bookings';
      userIdField = 'user_id';
    } else if (type === 'consultation') {
      table = 'lecturer_appointments';
      userIdField = 'student_id';
    } else if (type === 'maintenance') {
      table = 'maintenance_requests';
      userIdField = 'user_id';
    } else {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid type' 
      });
    }

    const [result] = await db.query(
      `UPDATE ${table} SET status = ?, modified_at = NOW() WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Record not found' 
      });
    }

    const [record] = await db.query(
      `SELECT ${userIdField} as user_id FROM ${table} WHERE id = ?`,
      [id]
    );
    const userId = record[0].user_id;

    const notificationType = type === 'study-room' ? 'study-room' : 
                            type === 'maintenance' ? 'maintenance' : null;
    if (notificationType) {
      const message = `${notificationType === 'maintenance' 
        ? `Your maintenance request (ID: ${id}) has been ${status}.`
        : `Your ${notificationType} booking (ID: ${id}) has been ${status}.`}`;

      const [existingNotification] = await db.query(
        `SELECT id FROM notifications WHERE related_id = ? AND type = ?`,
        [id, notificationType]
      );

      if (existingNotification.length > 0) {
        await db.query(
          `UPDATE notifications SET message = ?, is_read = 0, created_at = NOW() WHERE id = ?`,
          [message, existingNotification[0].id]
        );
      } else {
        await db.query(
          `INSERT INTO notifications (user_id, title, message, is_read, created_at, type, related_id) 
           VALUES (?, ?, ?, 0, NOW(), ?, ?)`,
          [userId, `${notificationType} ${status}`, message, notificationType, id]
        );
      }
    }

    res.json({ 
      success: true,
      message: `Status updated to ${status}` 
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status',
      details: error.message
    });
  }
});

// Cancel booking/maintenance endpoint
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (!id || !type) {
      return res.status(400).json({ 
        success: false,
        error: 'ID and type are required' 
      });
    }

    if (type === 'study-room') {
      await db.query(
        `DELETE FROM room_bookings WHERE id = ?`,
        [id]
      );
    } else if (type === 'consultation') {
      await db.query(
        `DELETE FROM lecturer_appointments WHERE id = ?`,
        [id]
      );
    } else if (type === 'maintenance') {
      await db.query(
        `DELETE FROM maintenance_requests WHERE id = ?`,
        [id]
      );
    } else {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid type' 
      });
    }

    return res.json({ 
      success: true,
      message: `${type} deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete record',
      details: error.message
    });
  }
});

// GET bookings/maintenance for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const params = [userId];
    let roomQuery = `
      SELECT 
        rb.*,
        r.name as room_name,
        r.building,
        'study-room' as type,
        rb.start_time,
        rb.end_time,
        rb.booking_date
      FROM room_bookings rb
      JOIN rooms r ON rb.room_id = r.id
      WHERE rb.user_id = ?
    `;
    let consultationQuery = `
      SELECT 
        la.*,
        CONCAT(l.first_name, ' ', l.last_name) as lecturer_name,
        'consultation' as type,
        TIME(la.appointment_time) as start_time,
        TIME(DATE_ADD(la.appointment_time, INTERVAL la.duration_minutes MINUTE)) as end_time,
        DATE(la.appointment_time) as booking_date
      FROM lecturer_appointments la
      JOIN lecturers l ON la.lecturer_id = l.id
      WHERE la.student_id = ?
    `;

    if (status) {
      roomQuery += ` AND rb.status = ?`;
      consultationQuery += ` AND la.status = ?`;
      params.push(status);
    }

    const [roomBookings] = await db.query(roomQuery, params);
    const [consultations] = await db.query(consultationQuery, params);

    const allBookings = [...roomBookings, ...consultations];
    return res.status(200).json({ success: true, data: allBookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user bookings',
      details: error.message,
    });
  }
});

module.exports = router;