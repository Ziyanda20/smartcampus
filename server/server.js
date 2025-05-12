require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Make jwt available to all routes
app.use((req, res, next) => {
  req.jwt = jwt;
  next();
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/booking', require('./routes/booking'));
app.use('/maintenance', require('./routes/maintenance'));
app.use('/notifications', require('./routes/notifications'));
app.use('/schedule', require('./routes/schedule'));
app.use('/admin', require('./routes/admin'));
app.use('/lecturers', require('./routes/lecturers'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});