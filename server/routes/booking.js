const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get available rooms
router.get('/rooms', async (req, res) => {
  try {
    const [rooms] = await db.execute(
      `SELECT r.*, 
       (SELECT COUNT(*) FROM room_bookings rb 
        WHERE rb.room_id = r.id 
        AND rb.booking_date = CURDATE() 
        AND rb.status = 'approved') as booked_today
       FROM rooms r
       ORDER BY r.name`
    );
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { room_id, booking_date, start_time, end_time, purpose } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decoded = req.jwt.verify(token, process.env.JWT_SECRET);
    
    // Check for time conflicts
    const [conflicts] = await db.execute(
      `SELECT * FROM room_bookings 
       WHERE room_id = ? AND booking_date = ? AND status != 'rejected'
       AND (
         (start_time < ? AND end_time > ?) OR
         (start_time >= ? AND start_time < ?) OR
         (end_time > ? AND end_time <= ?)
       )`,
      [room_id, booking_date, end_time, start_time, start_time, end_time, start_time, end_time]
    );
    
    if (conflicts.length > 0) {
      return res.status(400).json({ 
        error: 'Time conflict with existing booking',
        conflicts: conflicts.map(c => ({
          id: c.id,
          time: `${c.start_time}-${c.end_time}`,
          status: c.status
        }))
      });
    }
    
    // Create booking
    const [result] = await db.execute(
      `INSERT INTO room_bookings 
       (user_id, room_id, booking_date, start_time, end_time, purpose, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [decoded.id, room_id, booking_date, start_time, end_time, purpose]
    );
    
    res.status(201).json({ 
      message: 'Booking request submitted',
      bookingId: result.insertId,
      status: 'pending'
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user's bookings
router.get('/my-bookings', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = req.jwt.verify(token, process.env.JWT_SECRET);
    
    const [bookings] = await db.execute(
      `SELECT rb.*, r.name as room_name, r.building 
       FROM room_bookings rb
       JOIN rooms r ON rb.room_id = r.id
       WHERE user_id = ?
       ORDER BY booking_date DESC, start_time DESC`,
      [decoded.id]
    );
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Cancel a booking
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = req.jwt.verify(token, process.env.JWT_SECRET);
    const { id } = req.params;
    
    // Verify user owns the booking
    const [booking] = await db.execute(
      'SELECT * FROM room_bookings WHERE id = ? AND user_id = ?',
      [id, decoded.id]
    );
    
    if (booking.length === 0) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }
    
    // Only allow cancelling pending bookings
    if (booking[0].status !== 'pending') {
      return res.status(400).json({ error: 'Only pending bookings can be cancelled' });
    }
    
    await db.execute(
      'DELETE FROM room_bookings WHERE id = ?',
      [id]
    );
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;