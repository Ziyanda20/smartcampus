import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Import your components
import HomePage from "./components/HomePage"; // Home page (default starting page)
import Login from "./components/Login";
import LoggedHomePage from "./components/LoggedHomePage";
import Bookings from "./components/Bookings";
import Timetable from "./components/Timetable";
import Maintenance from "./components/Maintenance";
import Announcements from "./components/Announcements";

/* Lecturer */
import HomeLecturer from "./components/Lecturer/HomeLecturer";
import BookingsLecturer from "./components/Lecturer/BookingsLecturer";
import MaintenanceLecturer from "./components/Lecturer/MaintenanceLecturer";
import AnnouncementLecturer from "./components/Lecturer/AnnouncementLecturer";

/* Admin */
import AnalyticsPage from "./components/Admin/AnalyticsPage";
import MaintenanceManagement from "./components/Admin/MaintenanceManagement";
import BookingsManagement from "./components/Admin/BookingsManagement";
import TimetableManagement from "./components/Admin/TimetableManagement";

// Import ProtectedRoute
import ProtectedRoute from "./components/ProtectedRoute";

// Helper function to get user role from token
const getUserRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch (error) {
    console.error("Error decoding token:", error);
    localStorage.removeItem("token"); // Clear invalid token
    return null;
  }
};

function App() {
  const userRole = getUserRole();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} /> {/* Start at HomePage */}
        <Route path="/login" element={<Login />} /> {/* Public login page */}

        {/* Student Routes (role: "student") */}
        <Route
          path="/logged-home"
          element={
            <ProtectedRoute element={LoggedHomePage} allowedRoles={["student"]} />
          }
        />
        <Route
          path="/bookings"
          element={<ProtectedRoute element={Bookings} allowedRoles={["student"]} />}
        />
        <Route
          path="/timetable"
          element={<ProtectedRoute element={Timetable} allowedRoles={["student"]} />}
        />
        <Route
          path="/maintenance"
          element={<ProtectedRoute element={Maintenance} allowedRoles={["student"]} />}
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute element={Announcements} allowedRoles={["student"]} />
          }
        />

        {/* Lecturer Routes (role: "lecturer") */}
        <Route
          path="/home-lecturer"
          element={
            <ProtectedRoute element={HomeLecturer} allowedRoles={["lecturer"]} />
          }
        />
        <Route
          path="/booking-lecturer"
          element={
            <ProtectedRoute element={BookingsLecturer} allowedRoles={["lecturer"]} />
          }
        />
        <Route
          path="/maintenance-lecturer"
          element={
            <ProtectedRoute element={MaintenanceLecturer} allowedRoles={["lecturer"]} />
          }
        />
        <Route
          path="/announcement-lecturer"
          element={
            <ProtectedRoute element={AnnouncementLecturer} allowedRoles={["lecturer"]} />
          }
        />

        {/* Admin Routes (role: "admin") */}
        <Route
          path="/analytics-page"
          element={
            <ProtectedRoute element={AnalyticsPage} allowedRoles={["admin"]} />
          }
        />
        <Route
          path="/maintenance-admin"
          element={
            <ProtectedRoute element={MaintenanceManagement} allowedRoles={["admin"]} />
          }
        />
        <Route
          path="/bookings-admin"
          element={
            <ProtectedRoute element={BookingsManagement} allowedRoles={["admin"]} />
          }
        />
        <Route
          path="/timetable-admin"
          element={
            <ProtectedRoute element={TimetableManagement} allowedRoles={["admin"]} />
          }
        />

        {/* Fallback Route for Invalid Paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;