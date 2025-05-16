import React, { useEffect, useState } from "react";
import { CalendarDays, Clock, Wrench, Bell } from "lucide-react";
import Navbar from "./NavBar";
import api from "../api";
import { jwtDecode } from "jwt-decode";

export default function LoggedHomePage() {
  const [firstName, setFirstName] = useState("");
  const [stats, setStats] = useState({
    activeBookings: 0,
    classesToday: 0,
    pendingMaintenance: 0,
    newAnnouncements: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Token decoding error:", err);
      setError("Invalid token.");
      setLoading(false);
      return;
    }

    const userId = decoded.id || decoded.userId;
    const role = decoded.role;
    const name = decoded.fullName || decoded.name || decoded.username || "";

    setFirstName(name.split(" ")[0] || "");

    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [bookingsData, maintenanceData, announcementsData] = await Promise.all([
          fetchBookings(userId),
          fetchMaintenance(userId, role),
          fetchAnnouncements(userId)
        ]);

        // If user is a lecturer, get schedule
        if (role === "lecturer") {
          await fetchLecturerSchedule(userId);
        }

        // Process bookings - active are upcoming with approved/pending status
        const today = new Date();
        const activeBookings = bookingsData.filter(booking => {
          const bookingDate = new Date(booking.booking_date || booking.appointment_time || today);
          const isUpcoming = bookingDate >= today;
          const isActiveStatus = ['approved', 'pending'].includes(booking.status?.toLowerCase());
          return isUpcoming && isActiveStatus;
        }).length;

        // Get upcoming bookings (next 7 days) with approved/pending status
        const upcoming = getUpcomingBookings(
          bookingsData.filter(b => ['approved', 'pending'].includes(b.status?.toLowerCase()))
        );
        setUpcomingBookings(upcoming);

        // Process maintenance
        const pendingMaintenance = maintenanceData.length;

        // Process announcements - only unread (is_read: 0)
        const unreadAnnouncements = announcementsData.filter(a => a.is_read === 0);
        const newAnnouncements = unreadAnnouncements.length;
        setRecentAnnouncements(unreadAnnouncements.slice(0, 3));

        // Update stats
        setStats({
          activeBookings,
          pendingMaintenance,
          newAnnouncements,
          classesToday: stats.classesToday
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err.response?.data || err.message);
        setError("Failed to load dashboard data. Check console for details.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchBookings = async (userId) => {
    try {
      const response = await api.get(`/bookings/user/${userId}`);
      console.log("Bookings response:", response.data);
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching bookings:", error.response?.data || error.message);
      return [];
    }
  };

  const fetchMaintenance = async (userId, role) => {
    try {
      const params = role === "admin" 
        ? { status: "pending" } 
        : { status: "pending", userId };
      
      const response = await api.get("/maintenance", { params });
      console.log("Maintenance response:", response.data);
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching maintenance:", error.response?.data || error.message);
      return [];
    }
  };

  const fetchAnnouncements = async (userId) => {
    try {
      const response = await api.get(`/announcements?userId=${userId}&is_read=0`);
      console.log("Announcements response:", response.data);
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching announcements:", error.response?.data || error.message);
      return [];
    }
  };

  const fetchLecturerSchedule = async (lecturerId) => {
    try {
      const response = await api.get(`/lecturers/${lecturerId}/schedule`);
      const schedule = response.data.data || [];

      const todayName = new Date().toLocaleDateString("en-US", {
        weekday: "long",
      }).toLowerCase();

      const classesTodayCount = schedule.filter(
        (cls) => cls.day.toLowerCase() === todayName
      ).length;

      setStats(prev => ({
        ...prev,
        classesToday: classesTodayCount
      }));
    } catch (error) {
      console.error("Error fetching lecturer schedule:", error.response?.data || error.message);
    }
  };

  const getUpcomingBookings = (bookings) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return bookings
      .filter(booking => {
        const bookingDate = new Date(booking.booking_date || booking.appointment_time);
        return bookingDate >= today && bookingDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.booking_date || a.appointment_time) - new Date(b.booking_date || b.appointment_time));
  };

  const formatTime = (time) => {
    if (!time) return "";
    if (typeof time === 'string') {
      return time.slice(0, 5); // Extracts "HH:MM" from "HH:MM:SS"
    }
    return time.toLocaleTimeString().slice(0, 5); // Fallback for Date objects
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container my-5">
          <p>Loading dashboard...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container my-5">
          <p className="text-danger">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <div className="mb-4">
          <h2 className="h4">Welcome back, {firstName}!</h2>
          <p className="text-muted">
            Here's what's happening across your campus today.
          </p>
        </div>

        <div className="row mb-5">
          <StatCard
            Icon={CalendarDays}
            title="Active Bookings"
            count={stats.activeBookings}
          />
          <StatCard
            Icon={Clock}
            title="Classes Today"
            count={stats.classesToday}
          />
          <StatCard
            Icon={Wrench}
            title="Pending Maintenance"
            count={stats.pendingMaintenance}
          />
          <StatCard
            Icon={Bell}
            title="New Announcements"
            count={stats.newAnnouncements}
          />
        </div>

        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="card">
              <div className="card-header">Upcoming Bookings</div>
              <div className="card-body">
                {upcomingBookings.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {upcomingBookings.map((booking) => (
                      <li key={booking.id} className="list-group-item">
                        <strong>{booking.room_name || booking.lecturer_name || "Booking"}</strong>
                        <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                          {new Date(booking.booking_date || booking.appointment_time).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          | {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          <span className={`badge ms-2 ${
                            booking.status?.toLowerCase() === 'approved' 
                              ? 'bg-success' 
                              : 'bg-warning text-dark'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div>Purpose: {booking.purpose}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="card-text text-muted">
                    No upcoming bookings within the next 7 days.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6 mb-4">
            <div className="card">
              <div className="card-header">Announcements</div>
              <div className="card-body">
                {recentAnnouncements.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {recentAnnouncements.map((ann) => (
                      <li key={ann.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <strong>{ann.title}</strong>
                          <span className="badge bg-primary">New</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                          {new Date(ann.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          - {ann.sender_name || "System"}
                        </div>
                        <div>{ann.message}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="card-text text-muted">
                    No new announcements available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ Icon, title, count }) {
  return (
    <div className="col-md-3 mb-3">
      <div className="card text-center">
        <div className="card-body">
          <Icon className="mb-2" />
          <h5 className="card-title">{title}</h5>
          <p className="card-text">{count}</p>
        </div>
      </div>
    </div>
  );
}