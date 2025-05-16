const express = require('express');
const router = express.Router();
const db = require('../config/db'); // your MySQL connection or pool

// Get all study room bookings
router.get('/bookings', async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT id, type, room, building, date, time, end_time, status
      FROM bookings
      ORDER BY date, time
    `);
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
      details: error.message,
    });
  }
});

// Create a new booking
router.post('/bookings', async (req, res) => {
  try {
    const { type, room, building, date, time, endTime } = req.body;

    if (!type || !room || !building || !date || !time || !endTime) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const [result] = await db.query(
      `INSERT INTO bookings (type, room, building, date, time, end_time, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [type, room, building, date, time, endTime]
    );

    const [newBooking] = await db.query(`SELECT * FROM bookings WHERE id = ?`, [result.insertId]);

    res.status(201).json({ success: true, data: newBooking[0] });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      details: error.message,
    });
  }
});

// Cancel a booking by id
router.patch('/bookings/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      `UPDATE bookings SET status = 'Cancelled' WHERE id = ? AND status != 'Cancelled'`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found or already cancelled' });
    }

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking',
      details: error.message,
    });
  }
});

// Get all consultation bookings
router.get('/consultations', async (req, res) => {
  try {
    const [consultations] = await db.query(`
      SELECT id, student, topic, date, time, status
      FROM consultations
      ORDER BY date, time
    `);
    res.json({ success: true, data: consultations });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch consultations',
      details: error.message,
    });
  }
});

// Accept a consultation booking
router.patch('/consultations/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      `UPDATE consultations SET status = 'Accepted' WHERE id = ? AND status = 'Pending'`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Consultation not found or cannot be accepted' });
    }

    res.json({ success: true, message: 'Consultation accepted successfully' });
  } catch (error) {
    console.error('Error accepting consultation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept consultation',
      details: error.message,
    });
  }
});

// Cancel a consultation booking
router.patch('/consultations/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      `UPDATE consultations SET status = 'Cancelled' WHERE id = ? AND status != 'Cancelled'`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Consultation not found or already cancelled' });
    }

    res.json({ success: true, message: 'Consultation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling consultation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel consultation',
      details: error.message,
    });
  }
});

module.exports = router;
