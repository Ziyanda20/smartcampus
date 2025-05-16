require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const jwt = require("jsonwebtoken");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Make jwt available to all routes
app.use((req, res, next) => {
  req.jwt = jwt;
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin")); // Assuming admin routes are defined
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/lecturers", require("./routes/lecturers"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/maintenance", require("./routes/maintenance"));
app.use("/api/timetable", require("./routes/timetable"));
app.use("/users", require("./routes/users"));
app.use("/api/bookingslecturer", require("./routes/bookingslecturer"));
app.use("/api/lecturer-announcements", require("./routes/announcementLecturer"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});