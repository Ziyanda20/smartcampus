import React, { useEffect, useState } from "react";
import { Container, Row, Col, Nav, Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import api from "../../api"; // Your axios instance configured with baseURL
import "./AnalyticsPage.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    bookingsByStatus: { confirmed: 0, pending: 0, rejected: 0 },
    pendingMaintenance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get("/admin/dashboard-stats");
        setStats(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard stats");
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Chart data for bookingsByStatus
  const bookingsData = {
    labels: ["Confirmed", "Pending", "Rejected"],
    datasets: [
      {
        label: "Bookings",
        data: [stats.bookingsByStatus.confirmed, stats.bookingsByStatus.pending, stats.bookingsByStatus.rejected],
        backgroundColor: ["#4CAF50", "#FF9800", "#F44336"],
        borderColor: ["#388E3C", "#F57C00", "#D32F2F"],
        borderWidth: 1,
      },
    ],
  };

  // Chart options for bookingsByStatus
  const bookingsOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Bookings by Status" },
    },
  };

  // Chart data for pendingMaintenance
  const maintenanceData = {
    labels: ["Pending Maintenance", "Completed Maintenance"],
    datasets: [
      {
        data: [stats.pendingMaintenance, 10 - stats.pendingMaintenance], // Assuming a max of 10 for demo; adjust as needed
        backgroundColor: ["#FF9800", "#4CAF50"],
        borderColor: ["#F57C00", "#388E3C"],
        borderWidth: 1,
      },
    ],
  };

  // Chart options for pendingMaintenance
  const maintenanceOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Maintenance Status" },
    },
  };

  // Dashboard content
  const DashboardOverviewContent = () => (
    <div>
      <h2>Dashboard Overview</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <Row className="mb-4">
          <Col md={6}>
            <Card className="shadow-sm mb-3">
              <Card.Body>
                <Card.Title>Pending Maintenance</Card.Title>
                <Card.Text>{stats.pendingMaintenance}</Card.Text>
                <Doughnut data={maintenanceData} options={maintenanceOptions} />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm mb-3">
              <Card.Body>
                <Card.Title>Confirmed Bookings</Card.Title>
                <Card.Text>{stats.bookingsByStatus.confirmed || 0}</Card.Text>
              </Card.Body>
            </Card>
            <Card className="shadow-sm mb-3">
              <Card.Body>
                <Card.Title>Pending Bookings</Card.Title>
                <Card.Text>{stats.bookingsByStatus.pending || 0}</Card.Text>
              </Card.Body>
            </Card>
            <Card className="shadow-sm mb-3">
              <Card.Body>
                <Card.Title>Rejected Bookings</Card.Title>
                <Card.Text>{stats.bookingsByStatus.rejected || 0}</Card.Text>
                <Bar data={bookingsData} options={bookingsOptions} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );

  return (
    <Container fluid className="p-0">
      <div className="dashboard-header text-white p-3 mb-0 d-flex justify-content-between align-items-center">
        <h1 className="mb-0">Admin Dashboard</h1>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <Row className="no-gutters">
        <Col md={3} className="left-sidebar text-white">
          <div className="p-3 min-vh-100">
            <h4 className="mb-4">CampusConnect</h4>
            <Nav className="flex-column">
              <Nav.Item>
                <Nav.Link as={Link} to="/analytics-page">
                  Dashboard Overview
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/maintenance-admin">
                  Maintenance Management
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/bookings-admin">
                  Bookings Management
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/timetable-admin">
                  Timetable Management
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
        </Col>

        <Col md={9} className="p-4">
          <DashboardOverviewContent />
        </Col>
      </Row>
    </Container>
  );
}