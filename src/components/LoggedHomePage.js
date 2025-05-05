import React from "react";
import { CalendarDays, Clock, Wrench, Bell } from "lucide-react";
import Navbar from "./NavBar"; // Adjust path as needed

export default function LoggedHomePage() {
  const user = { fullName: "John Doe" }; // Simulated user data

  const stats = {
    activeBookings: 5,
    classesToday: 3,
    pendingMaintenance: 2,
    newAnnouncements: 4,
  };

  return (
    <>
      <Navbar />

      <div className="container my-5">
        <div className="mb-4">
          <h2 className="h4">Welcome back, {user.fullName.split(" ")[0]}!</h2>
          <p className="text-muted">Here's what's happening across your campus today.</p>
        </div>

        <div className="row mb-5">
          <div className="col-md-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <CalendarDays className="mb-2" />
                <h5 className="card-title">Active Bookings</h5>
                <p className="card-text">{stats.activeBookings}</p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <Clock className="mb-2" />
                <h5 className="card-title">Classes Today</h5>
                <p className="card-text">{stats.classesToday}</p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <Wrench className="mb-2" />
                <h5 className="card-title">Pending Maintenance</h5>
                <p className="card-text">{stats.pendingMaintenance}</p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <Bell className="mb-2" />
                <h5 className="card-title">New Announcements</h5>
                <p className="card-text">{stats.newAnnouncements}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="card">
              <div className="card-header">Upcoming Bookings</div>
              <div className="card-body">
                <p className="card-text">You have 2 bookings this week.</p>
              </div>
            </div>
          </div>

          <div className="col-lg-6 mb-4">
            <div className="card">
              <div className="card-header">Announcements</div>
              <div className="card-body">
                <p className="card-text">There are 4 new announcements available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
