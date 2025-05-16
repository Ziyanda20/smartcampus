const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT id, name, building FROM rooms');
    console.log('Fetched rooms:', rooms);
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch rooms', details: error.message });
  }
});

module.exports = router;