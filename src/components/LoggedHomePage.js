import React, { useEffect, useState } from "react";
import { CalendarDays, Clock, Wrench, Bell } from "lucide-react";
import Navbar from "./NavBar"; // Adjust path if needed
import api from "../api";
import jwt_decode from "jwt-decode";

export default function LoggedHomePage() {
  const [firstName, setFirstName] = useState("");
  const [stats, setStats] = useState({
    activeBookings: 0,
    classesToday: 0,
    pendingMaintenance: 0,
    newAnnouncements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    const decoded = jwt_decode(token);
    const userId = decoded.id || decoded.userId;
    const role = decoded.role;
    const name = decoded.fullName || decoded.name || decoded.username || "";

    setFirstName(name.split(" ")[0] || "");

    const fetchData = async () => {
      try {
        // Fetch schedule if lecturer
        if (role === "lecturer") {
          await fetchLecturerSchedule(userId);
        }

        // Fetch other stats regardless of role
        await fetchOtherStats(userId, role);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchLecturerSchedule = async (lecturerId) => {
    try {
      const response = await api.get(`/lecturers/${lecturerId}/schedule`);
      const schedule = response.data.data || [];

      const todayName = new Date().toLocaleDateString("en-US", {
        weekday: "long",
      });

      const classesTodayCount = schedule.filter((cls) => cls.day === todayName)
        .length;

      setStats((prev) => ({
        ...prev,
        classesToday: classesTodayCount,
      }));
    } catch (error) {
      console.error("Error fetching lecturer schedule:", error);
      
    }
  };

  const fetchOtherStats = async (userId, role) => {
    try {
      // Example API calls — replace endpoints and query params as per your backend

      // Active Bookings
      const bookingsRes = await api.get(
        `/users/${userId}/bookings?status=active`
      );
      const activeBookings = bookingsRes.data.data?.length || 0;

      // Pending Maintenance 
      const maintenanceRes = await api.get(
        `/maintenance-requests?status=pending&userId=${userId}`
      );
      const pendingMaintenance = maintenanceRes.data.data?.length || 0;

      // New Announcements (unread)
      const announcementsRes = await api.get(
        `/notifications?userId=${userId}&is_read=0`
      );
      const newAnnouncements = announcementsRes.data.data?.length || 0;

      setStats((prev) => ({
        ...prev,
        activeBookings,
        pendingMaintenance,
        newAnnouncements,
      }));
    } catch (error) {
      console.error("Error fetching other stats:", error);
      // You could optionally set default 0 here
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="container my-5">
          <p>Loading dashboard...</p>
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Navbar />
        <div className="container my-5">
          <p className="text-danger">{error}</p>
        </div>
      </>
    );

  return (
    <>
      <Navbar />

      <div className="container my-5">
        <div className="mb-4">
          <h2 className="h4">Welcome back, {firstName}!</h2>
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
                <p className="card-text">
                  You have {stats.activeBookings} bookings this week.
                </p>
              </div>
            </div>
          </div>

          <div className="col-lg-6 mb-4">
            <div className="card">
              <div className="card-header">Announcements</div>
              <div className="card-body">
                <p className="card-text">
                  There are {stats.newAnnouncements} new announcements available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
