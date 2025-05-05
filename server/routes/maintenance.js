const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateUser } = require('../middleware/auth');

// Submit maintenance request
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { room_id, description } = req.body; // Removed title since your schema doesn't have it
    
    if (!room_id || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify room exists
    const [room] = await db.query(
      'SELECT id, name FROM rooms WHERE id = ?',
      [room_id]
    );
    
    if (room.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const [result] = await db.query(
      `INSERT INTO maintenance_requests 
       (room_id, user_id, description, status)
       VALUES (?, ?, ?, 'pending')`,
      [room_id, req.user.id, description]
    );
    
    // Get the newly created request
    const [newRequest] = await db.query(
      `SELECT mr.*, r.name as room_name, r.building 
       FROM maintenance_requests mr
       JOIN rooms r ON mr.room_id = r.id
       WHERE mr.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({ 
      message: 'Maintenance request submitted successfully',
      data: newRequest[0]
    });
  } catch (error) {
    console.error('Maintenance submission error:', error);
    res.status(500).json({ 
      error: 'Failed to submit maintenance request',
      details: error.message 
    });
  }
});

// Get user's maintenance requests
router.get('/my-requests', authenticateUser, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        mr.id,
        mr.room_id,
        mr.description,
        mr.status,
        mr.admin_feedback,
        mr.created_at,
        mr.modified_at as updated_at,
        r.name as room_name,
        r.building
      FROM maintenance_requests mr
      JOIN rooms r ON mr.room_id = r.id
      WHERE mr.user_id = ?
    `;
    
    const params = [req.user.id];
    
    if (status) {
      query += ' AND mr.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY mr.created_at DESC';
    
    const [requests] = await db.query(query, params);
    
    res.json({ data: requests });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ 
      error: 'Failed to fetch your maintenance requests',
      details: error.message 
    });
  }
});

// Get single maintenance request
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [request] = await db.query(
      `SELECT 
        mr.*, 
        r.name as room_name, 
        r.building,
        u.username as user_name
       FROM maintenance_requests mr
       JOIN rooms r ON mr.room_id = r.id
       JOIN users u ON mr.user_id = u.id
       WHERE mr.id = ?`,
      [id]
    );
    
    if (request.length === 0) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }
    
    // Check if user owns the request or is admin
    if (request[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to view this request' });
    }
    
    res.json({ data: request[0] });
  } catch (error) {
    console.error('Error fetching maintenance request:', error);
    res.status(500).json({ 
      error: 'Failed to fetch maintenance request',
      details: error.message 
    });
  }
});

module.exports = router;