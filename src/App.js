import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


// Import your components
import HomePage from './components/HomePage'; // Home page
import Login from "./components/Login";
import LoggedHomePage from "./components/LoggedHomePage"
import Bookings  from "./components/Bookings";
import Timetable from "./components/Timetable";
import Maintenance from "./components/Maintenance";
import Announcements from "./components/Announcements";

 /* Lecturer */
import HomeLecturer from "./components/Lecturer/HomeLecturer";
import BookingsLecturer from "./components/Lecturer/BookingsLecturer";
import MaintenanceLecturer from "./components/Lecturer/MaintenanceLecturer";
import AnnouncementLecturer from "./components/Lecturer/AnnouncementLecturer";

/*Admin */
import AnalyticsPage from "./components/Admin/AnalyticsPage";

function App() {
  return (
  
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logged-home" element={<LoggedHomePage />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/announcements" element={<Announcements />} />

           {/*Lecturer */}
          <Route path="/home-lecturer" element={<HomeLecturer />} />
          <Route path="/booking-lecturer" element={<BookingsLecturer />} />
          <Route path="/maintenance-lecturer" element={<MaintenanceLecturer />} />
          <Route path="/announcement-lecturer" element={<AnnouncementLecturer />} />

          {/*Admin */}
          <Route path="/analytics-page" element={<AnalyticsPage />} />

        </Routes>
      </Router>
    
  );
}

export default App;
