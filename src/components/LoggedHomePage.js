import React, { useEffect, useState } from "react";
import { CalendarDays, Clock, Wrench, Bell } from "lucide-react";
import Navbar from "./NavBar"; // Adjust path if needed
import api from "../api"; // Your axios instance configured with baseURL
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

    let decoded;
    try {
      decoded = jwt_decode(token);
    } catch {
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
        // If user is a lecturer, get schedule
        if (role === "lecturer") {
          await fetchLecturerSchedule(userId);
        }

        // Fetch common stats (bookings, maintenance, announcements)
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

  // Fetch lecturer's schedule for today classes count
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
      // Could consider showing a message or fallback
    }
  };

  // Fetch bookings, maintenance, announcements counts
  const fetchOtherStats = async (userId, role) => {
    try {
      // Active bookings for the user
      const bookingsRes = await api.get(`/users/${userId}/bookings`, {
        params: { status: "active" },
      });
      const activeBookings = bookingsRes.data.data?.length || 0;

      // Pending maintenance requests for user (or all if admin)
      const maintenanceParams =
        role === "admin"
          ? { status: "pending" }
          : { status: "pending", userId };

      const maintenanceRes = await api.get("/maintenance-requests", {
        params: maintenanceParams,
      });
      const pendingMaintenance = maintenanceRes.data.data?.length || 0;

      // Unread announcements / notifications for user
      const announcementsRes = await api.get("/notifications", {
        params: { userId, is_read: 0 },
      });
      const newAnnouncements = announcementsRes.data.data?.length || 0;

      setStats((prev) => ({
        ...prev,
        activeBookings,
        pendingMaintenance,
        newAnnouncements,
      }));
    } catch (error) {
      console.error("Error fetching other stats:", error);
      // Optionally set defaults here if you want
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
                  There are {stats.newAnnouncements} new announcements
                  available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Reusable small component for stats cards
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
