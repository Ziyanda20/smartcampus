import React from "react";
import { Container, Row, Col, Nav, Card } from "react-bootstrap";
import { Link, Routes, Route } from "react-router-dom";
import MaintenanceManagement from "./MaintenanceManagement";
import BookingsManagement from "./BookingsManagement";
import TimetableManagement from "./TimetableManagement";
import "./AnalyticsPage.css";

export default function AnalyticsPage() {
 const bookings = [
  { id: 1, roomId: "A", purpose: "Presentation", status: "confirmed", date: "2025-05-10", requestedBy: "Lecturer" },
  { id: 2, roomId: "B", purpose: "Meeting", status: "pending", date: "2025-05-09", requestedBy: "Student" },
  { id: 3, roomId: "C", purpose: "Workshop", status: "rejected", date: "2025-05-08", requestedBy: "Lecturer" },
  { id: 4, roomId: "D", purpose: "Lecture", status: "pending", date: "2025-05-07", requestedBy: "Student" },
];


  const stats = { pendingMaintenance: 4 };

  const bookingsByStatus = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {});

  // Dashboard content inline here
  const DashboardOverviewContent = () => (
    <div>
      <h2>Dashboard Overview</h2>
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <Card.Title>Pending Maintenance</Card.Title>
              <Card.Text>{stats.pendingMaintenance}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <Card.Title>Confirmed Bookings</Card.Title>
              <Card.Text>{bookingsByStatus.confirmed || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <Card.Title>Pending Bookings</Card.Title>
              <Card.Text>{bookingsByStatus.pending || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <Container fluid className="p-0">
      <div className="dashboard-header text-white p-3 mb-0">
        <h1 className="mb-0">Admin Dashboard</h1>
      </div>
      <Row className="no-gutters">
        <Col md={3} className="left-sidebar text-white">
          <div className="p-3 min-vh-100">
            <h4 className="mb-4">CampusConnect</h4>
            <Nav className="flex-column">
              <Nav.Item>
                <Nav.Link as={Link} to="/maintenance-admin">Maintenance Management</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/bookings-admin">Bookings Management</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/timetable-admin">Timetable Management</Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
        </Col>

        <Col md={9} className="p-4">
          <Routes>
            <Route index element={<DashboardOverviewContent />} /> 
            <Route path="dashboard-admin" element={<DashboardOverviewContent />} />  
            <Route path="maintenance-admin" element={<MaintenanceManagement stats={stats} />} />
            <Route path="bookings-admin" element={<BookingsManagement bookings={bookings} />} />
            <Route path="timetable-admin" element={<TimetableManagement />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
}
