const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');

// ====================== ANALYTICS ROUTES ======================

// Get comprehensive analytics data
router.get('/analytics', authenticateAdmin, async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    
    // Calculate date ranges
    let dateRange;
    switch(range) {
      case 'day': dateRange = '1 DAY'; break;
      case 'week': dateRange = '1 WEEK'; break;
      case 'month': dateRange = '1 MONTH'; break;
      case 'year': dateRange = '1 YEAR'; break;
      default: dateRange = '1 WEEK';
    }

    // Get all analytics data in parallel
    const [
      [systemStats],
      [bookingsTrend],
      [bookingStatus],
      [roomUsage] = await db.query(`
        SELECT 
          r.id,
          r.name,
          r.building,
          COUNT(rb.id) as booking_count
        FROM rooms r
        LEFT JOIN room_bookings rb ON r.id = rb.room_id
        WHERE rb.created_at >= DATE_SUB(NOW(), INTERVAL ${dateRange})
        AND rb.status = 'approved'
        GROUP BY r.id
        ORDER BY booking_count DESC
        LIMIT 10
      `),
      [maintenanceStats]
    ] = await Promise.all([
      db.query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as totalUsers,
          (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${dateRange})) as newUsers,
          (SELECT COUNT(*) FROM room_bookings WHERE status = 'approved') as activeBookings,
          (SELECT COUNT(*) FROM room_bookings WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${dateRange})) as newBookings,
          (SELECT COUNT(*) FROM maintenance_requests WHERE status = 'pending') as pendingIssues,
          (SELECT COUNT(*) FROM maintenance_requests WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${dateRange})) as newIssues
      `),
      db.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM room_bookings
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${dateRange})
        GROUP BY DATE(created_at)
        ORDER BY date
      `),
      db.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM room_bookings
        GROUP BY status
      `),
      db.query(`
        SELECT 
          r.id,
          r.name,
          r.building,
          COUNT(rb.id) as bookingCount
        FROM rooms r
        LEFT JOIN room_bookings rb ON r.id = rb.room_id
        WHERE rb.created_at >= DATE_SUB(NOW(), INTERVAL ${dateRange})
        GROUP BY r.id
        ORDER BY bookingCount DESC
        LIMIT 10
      `),
      db.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM maintenance_requests
        GROUP BY status
      `)
    ]);

    res.json({
      data: {
        systemStats: systemStats[0],
        bookingsTrend,
        bookingStatus,
        roomUsage,
        maintenanceStats,
        dateRange
      }
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      details: error.message 
    });
  }
});

// ====================== MAINTENANCE ROUTES ======================

// Get maintenance requests with filters
router.get('/maintenance', authenticateAdmin, async (req, res) => {
  try {
    const { status, roomId, userId, dateFrom, dateTo, search } = req.query;
    
    let query = `
      SELECT 
        mr.id,
        mr.user_id,
        mr.room_id,
        mr.description,
        mr.status,
        mr.admin_feedback,
        mr.created_at,
        mr.modified_at as updated_at,
        r.name as room_name,
        r.building,
        u.username as user_name,
        u.email as user_email
      FROM maintenance_requests mr
      JOIN rooms r ON mr.room_id = r.id
      JOIN users u ON mr.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND mr.status = ?';
      params.push(status);
    }
    
    if (roomId) {
      query += ' AND mr.room_id = ?';
      params.push(roomId);
    }
    
    if (userId) {
      query += ' AND mr.user_id = ?';
      params.push(userId);
    }
    
    if (dateFrom) {
      query += ' AND mr.created_at >= ?';
      params.push(dateFrom);
    }
    
    if (dateTo) {
      query += ' AND mr.created_at <= ?';
      params.push(dateTo);
    }
    
    if (search) {
      query += ' AND (mr.description LIKE ? OR r.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY mr.created_at DESC';
    
    const [requests] = await db.query(query, params);
    res.json({ 
      success: true,
      data: requests 
    });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch maintenance requests',
      details: error.message 
    });
  }
});
// Update maintenance request status
// Update maintenance request status
router.put('/maintenance/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_feedback } = req.body;
    
    if (!status || !['pending', 'in_progress', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    // First try with modified_at column
    try {
      await db.query(
        `UPDATE maintenance_requests 
         SET status = ?, admin_feedback = ?, modified_at = NOW() 
         WHERE id = ?`,
        [status, admin_feedback, id]
      );
    } catch (updateError) {
      // Fallback if modified_at doesn't exist (though your schema shows it does)
      if (updateError.code === 'ER_BAD_FIELD_ERROR') {
        await db.query(
          `UPDATE maintenance_requests 
           SET status = ?, admin_feedback = ? 
           WHERE id = ?`,
          [status, admin_feedback, id]
        );
      } else {
        throw updateError;
      }
    }
    
    // Get the updated request
    const [updatedRequest] = await db.query(
      `SELECT 
        mr.*, 
        r.name as room_name, 
        u.username as user_name,
        u.email as user_email
       FROM maintenance_requests mr
       JOIN rooms r ON mr.room_id = r.id
       JOIN users u ON mr.user_id = u.id
       WHERE mr.id = ?`,
      [id]
    );
    
    res.json({ 
      message: 'Maintenance request updated successfully',
      data: updatedRequest[0]
    });
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    res.status(500).json({ 
      error: 'Failed to update maintenance request',
      details: error.message 
    });
  }
});
// ====================== USER MANAGEMENT ======================

// Get all users with pagination
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.status,
        u.created_at,
        COUNT(*) OVER() as total_count
      FROM users u
    `;
    
    const params = [];
    
    if (search) {
      query += ' WHERE u.username LIKE ? OR u.email LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += `
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const [users] = await db.query(query, params);
    
    const totalCount = users.length > 0 ? users[0].total_count : 0;
    
    res.json({
      data: users.map(u => {
        const { total_count, ...userData } = u;
        return userData;
      }),
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message 
    });
  }
});


// Add this to your admin.js routes file
router.get('/bookings/recent', authenticateAdmin, async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT 
        rb.id,
        rb.room_id,
        rb.user_id,
        rb.booking_date,
        rb.start_time,
        rb.end_time,
        rb.purpose,
        rb.status,
        rb.created_at,
        r.name as room_name,
        r.building,
        u.username
      FROM room_bookings rb
      JOIN rooms r ON rb.room_id = r.id
      JOIN users u ON rb.user_id = u.id
      ORDER BY rb.created_at DESC
      LIMIT 10
    `);
    
    res.json({ data: bookings });
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recent bookings',
      details: error.message 
    });
  }
});

// Add available rooms endpoint
router.get('/rooms/available', authenticateAdmin, async (req, res) => {
  try {
    const [rooms] = await db.query(`
      SELECT * FROM rooms
      WHERE id NOT IN (
        SELECT room_id FROM room_bookings
        WHERE status = 'approved'
        AND booking_date = CURDATE()
      )
    `);
    
    res.json({ data: rooms });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ 
      error: 'Failed to fetch available rooms',
      details: error.message 
    });
  }
});


// Add these routes to your admin.js file

// Get all lecturers
router.get('/lecturers', authenticateAdmin, async (req, res) => {
  try {
    const [lecturers] = await db.query(`
      SELECT 
        l.*,
        d.name as department_name
      FROM lecturers l
      JOIN departments d ON l.department_id = d.id
    `);
    res.json({ data: lecturers });
  } catch (error) {
    console.error('Error fetching lecturers:', error);
    res.status(500).json({ error: 'Failed to fetch lecturers' });
  }
});

// Get all departments
router.get('/departments', authenticateAdmin, async (req, res) => {
  try {
    const [departments] = await db.query('SELECT * FROM departments');
    res.json({ data: departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// CRUD operations for lecturers
router.post('/lecturers', authenticateAdmin, async (req, res) => {
  try {
    const { first_name, last_name, email, department_id, employee_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO lecturers (first_name, last_name, email, department_id, employee_id) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, email, department_id, employee_id]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error adding lecturer:', error);
    res.status(500).json({ error: 'Failed to add lecturer' });
  }
});

router.put('/lecturers/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, department_id, employee_id } = req.body;
    await db.query(
      'UPDATE lecturers SET first_name = ?, last_name = ?, email = ?, department_id = ?, employee_id = ? WHERE id = ?',
      [first_name, last_name, email, department_id, employee_id, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating lecturer:', error);
    res.status(500).json({ error: 'Failed to update lecturer' });
  }
});

router.delete('/lecturers/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM lecturers WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting lecturer:', error);
    res.status(500).json({ error: 'Failed to delete lecturer' });
  }
});

// Add to admin.js routes

// Get all rooms
router.get('/rooms', authenticateAdmin, async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT * FROM rooms');
    res.json({ data: rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Get room booking statistics
router.get('/rooms/stats', authenticateAdmin, async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        r.id,
        r.name,
        r.building,
        COUNT(rb.id) as booking_count,
        SUM(CASE WHEN rb.status = 'approved' THEN 1 ELSE 0 END) as approved_count
      FROM rooms r
      LEFT JOIN room_bookings rb ON r.id = rb.room_id
      GROUP BY r.id
    `);
    res.json({ data: stats });
  } catch (error) {
    console.error('Error fetching room stats:', error);
    res.status(500).json({ error: 'Failed to fetch room statistics' });
  }
});



// Update user status
router.put('/users/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    await db.query(
      `UPDATE users 
       SET status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [status, id]
    );
    
    res.json({ 
      success: true,
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ 
      error: 'Failed to update user status',
      details: error.message 
    });
  }
});

// Delete user
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ 
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      details: error.message 
    });
  }
});

// In your admin.js routes file (backend)
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        id,
        username,
        email,
        role,
        status,
        created_at
      FROM users
    `;
    
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const params = [];
    const countParams = [];
    
    if (search) {
      query += ' WHERE username LIKE ? OR email LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
      countQuery += ' WHERE username LIKE ? OR email LIKE ?';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [users] = await db.query(query, params);
    const [[total]] = await db.query(countQuery, countParams);
    
    res.json({
      data: users,
      pagination: {
        total: total.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total.total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message 
    });
  }
});


// In your admin.js routes file
// Update booking status endpoint
router.put('/bookings/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid status value. Must be "approved", "rejected", or "pending"' 
      });
    }

    // First check if booking exists
    const [booking] = await db.query(
      'SELECT * FROM room_bookings WHERE id = ?',
      [id]
    );
    
    if (!booking.length) {
      return res.status(404).json({ 
        success: false,
        error: 'Booking not found' 
      });
    }

    // Update booking status - use modified_at if updated_at doesn't exist
    try {
      await db.query(
        `UPDATE room_bookings 
         SET status = ?, modified_at = NOW() 
         WHERE id = ?`,
        [status, id]
      );
    } catch (updateError) {
      // Fallback if modified_at also doesn't exist
      if (updateError.code === 'ER_BAD_FIELD_ERROR') {
        await db.query(
          `UPDATE room_bookings 
           SET status = ? 
           WHERE id = ?`,
          [status, id]
        );
      } else {
        throw updateError;
      }
    }

    // Get updated booking with details
    const [updatedBooking] = await db.query(`
      SELECT 
        rb.*, 
        r.name as room_name, 
        r.building,
        u.username,
        u.email
      FROM room_bookings rb
      JOIN rooms r ON rb.room_id = r.id
      JOIN users u ON rb.user_id = u.id
      WHERE rb.id = ?
    `, [id]);

    res.json({ 
      success: true,
      message: `Booking ${status} successfully`,
      data: updatedBooking[0]
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update booking status',
      details: error.message,
      sqlError: error.sqlMessage
    });
  }
});
module.exports = router;