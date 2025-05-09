import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';


export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate(); 


  // User is logged in by default
  const [user, setUser] = useState({ fullName: 'Jack Doe', username: 'jackdoe' });

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `nav-link px-3 py-2 mx-2 rounded ${
      isActive(path)
        ? 'bg-white text-primary fw-bold border border-white'
        : 'text-white'
    }`;

  const handleLogout = () => {
    setUser(null);
    navigate('/'); // Redirect to home
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Smart Campus
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav d-flex flex-row align-items-center">
            <li className="nav-item">
              <Link to="/home-lecturer" className={linkClass('/home-lecturer')}>
                Home
              </Link>
            </li>
            <li className="nav-item">
            <Link to="/booking-lecturer" className={linkClass('/booking-lecturer')}>
                Bookings
            </Link>
            </li>
            <li className="nav-item">
              <Link to="/timetable-lecturer" className={linkClass('/timetable-lecturer')}>
                Timetable
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/maintenance-lecturer" className={linkClass('/maintenance-lecturer')}>
                Maintenance
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/announcement-lecturer" className={linkClass('/announcement-lecturer')}>
                Announcements
              </Link>
            </li>

            {/* Sign Out Button Only */}
            {user && (
              <li className="nav-item ms-4">
                <button
                  className="btn btn-outline-light d-flex align-items-center"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="me-2" />
                  Sign out
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
