const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get maintenance requests
router.get('/', async (req, res) => {
  try {
    const { userId, status } = req.query;

    let query = `
      SELECT 
        mr.*,
        r.name as room_name,
        r.building,
        'maintenance' as type,
        u.full_name as requester_name 
      FROM maintenance_requests mr
      JOIN rooms r ON mr.room_id = r.id
      LEFT JOIN users u ON mr.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND mr.status = ?`;
      params.push(status);
    }

    if (userId) {
      query += ` AND mr.user_id = ?`;
      params.push(userId);
    }

    query += ` ORDER BY mr.created_at DESC`;

    const [maintenanceRequests] = await db.query(query, params);
    res.json({ success: true, data: maintenanceRequests });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch maintenance requests',
      details: error.message,
    });
  }
});

// Create maintenance request
router.post('/', async (req, res) => {
  try {
    const { userId, roomId, description, priority } = req.body;

    const [result] = await db.execute(
      'INSERT INTO maintenance_requests (user_id, room_id, description, priority, status, created_at, updated_at) VALUES (?, ?, ?, ?, "pending", NOW(), NOW())',
      [userId, roomId, description, priority || 'medium']
    );

    res.status(201).json({
      success: true,
      message: 'Maintenance request submitted successfully',
      requestId: result.insertId,
    });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit maintenance request',
      details: error.message,
    });
  }
});

// Update maintenance request status
router.patch('/:requestId/status', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminFeedback } = req.body;

    const [result] = await db.execute(
      'UPDATE maintenance_requests SET status = ?, admin_feedback = ?, updated_at = NOW() WHERE id = ?',
      [status, adminFeedback || null, requestId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    res.json({ success: true, message: 'Request status updated successfully' });
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update request status',
      details: error.message,
    });
  }
});

module.exports = router;