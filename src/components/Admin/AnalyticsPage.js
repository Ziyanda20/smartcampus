import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Tab,
  Nav,
  Spinner,
  ListGroup,
  Button,
} from "react-bootstrap";
import { BarChart, People, Tools } from "react-bootstrap-icons";

export default function AnalyticsPage() {
  const [tabKey, setTabKey] = useState("dashboard");

  // Mock data
  const users = [
    { id: 1, role: "student" },
    { id: 2, role: "lecturer" },
    { id: 3, role: "admin" },
    { id: 4, role: "student" },
  ];
  const bookings = [
    { id: 1, roomId: "A", purpose: "Presentation", status: "confirmed", date: "2025-05-10" },
    { id: 2, roomId: "B", purpose: "Meeting", status: "pending", date: "2025-05-09" },
    { id: 3, roomId: "C", purpose: "Workshop", status: "rejected", date: "2025-05-08" },
    { id: 4, roomId: "D", purpose: "Lecture", status: "confirmed", date: "2025-05-07" },
  ];
  const stats = { pendingMaintenance: 4 };

  const usersByRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  const bookingsByStatus = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {});

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Admin Dashboard</h1>
      <Tab.Container activeKey={tabKey} onSelect={(k) => setTabKey(k)}>
        <Row>
          {/* Sidebar */}
          <Col md={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="dashboard">Dashboard Overview</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="maintenance">Maintenance Management</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="bookings">Bookings Management</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="timetable">Timetable Management</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          {/* Content Area */}
          <Col md={9}>
            <Tab.Content>
              {/* Dashboard Overview */}
              <Tab.Pane eventKey="dashboard">
                <Row className="mb-4">
                  <Col md={4}>
                    <Card>
                      <Card.Body>
                        <Card.Title>Total Users</Card.Title>
                        <div className="d-flex align-items-center">
                          <People className="me-2" />
                          <h4 className="mb-0">{users.length}</h4>
                        </div>
                        <small className="text-muted">
                          {usersByRole.student || 0} students, {usersByRole.lecturer || 0} lecturers, {usersByRole.admin || 0} admins
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card>
                      <Card.Body>
                        <Card.Title>Active Bookings</Card.Title>
                        <div className="d-flex align-items-center">
                          <BarChart className="me-2" />
                          <h4 className="mb-0">{bookingsByStatus.confirmed || 0}</h4>
                        </div>
                        <small className="text-muted">
                          {bookingsByStatus.pending || 0} pending, {bookingsByStatus.rejected || 0} rejected
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card>
                      <Card.Body>
                        <Card.Title>Maintenance Requests</Card.Title>
                        <div className="d-flex align-items-center">
                          <Tools className="me-2" />
                          <h4 className="mb-0">{stats.pendingMaintenance}</h4>
                        </div>
                        <small className="text-muted">Pending maintenance requests</small>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Maintenance Management */}
              <Tab.Pane eventKey="maintenance">
                <Card>
                  <Card.Header>Maintenance Management</Card.Header>
                  <Card.Body>
                    <p className="text-muted">Manage all pending maintenance issues.</p>
                    <ListGroup>
                      {[...Array(stats.pendingMaintenance)].map((_, i) => (
                        <ListGroup.Item key={i} className="d-flex justify-content-between">
                          <span>Issue #{1000 + i}</span>
                          <Button variant="outline-success" size="sm">Mark as Resolved</Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Bookings Management */}
              <Tab.Pane eventKey="bookings">
                <Card>
                  <Card.Header>Bookings Management</Card.Header>
                  <Card.Body>
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border-bottom pb-2 mb-2">
                        <strong>Room {booking.roomId}</strong> - {booking.purpose} <br />
                        <small className="text-muted">Date: {booking.date} | Status: {booking.status}</small>
                        <div className="mt-1">
                          <Button variant="outline-primary" size="sm" className="me-2">Edit</Button>
                          <Button variant="outline-danger" size="sm">Cancel</Button>
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Timetable Management */}
              <Tab.Pane eventKey="timetable">
                <Card>
                  <Card.Header>Timetable Management</Card.Header>
                  <Card.Body>
                    <p className="text-muted">You can manage class schedules here.</p>
                    <div className="bg-light p-3 rounded">
                      <p><strong>Monday:</strong> Room A - 08:00 to 10:00 - Lecture</p>
                      <p><strong>Tuesday:</strong> Room B - 10:00 to 12:00 - Workshop</p>
                      <Button variant="outline-secondary" size="sm">Edit Timetable</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}
