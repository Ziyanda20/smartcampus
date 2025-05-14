import React, { useState } from "react";
import {Card,Button,Table, Badge,Alert,Container,Row,Col,Nav,} from "react-bootstrap";
import { Link } from "react-router-dom";

const dummyBookings = [
  {
    id: 1,
    roomId: "Study Room A",
    purpose: "Group Study",
    date: "2025-05-12",
    status: "pending",
    requestedBy: "Student - Thabo Nkosi",
  },
  {
    id: 2,
    roomId: "Study Room B",
    purpose: "Lecture Prep",
    date: "2025-05-10",
    status: "confirmed",
    requestedBy: "Lecturer - Dr. Maseko",
  },
  {
    id: 3,
    roomId: "Study Room C",
    purpose: "Assignment Discussion",
    date: "2025-05-08",
    status: "rejected",
    requestedBy: "Student - Lerato M",
  },
  {
    id: 4,
    roomId: "Study Room D",
    purpose: "Consultation",
    date: "2025-05-11",
    status: "pending",
    requestedBy: "Lecturer - Prof. Dlamini",
  },
];

const BookingsManagement = ({ bookings = dummyBookings }) => {
  const [bookingList, setBookingList] = useState(bookings);

  const handleStatusChange = (id, newStatus) => {
    const updated = bookingList.map((b) =>
      b.id === id ? { ...b, status: newStatus } : b
    );
    setBookingList(updated);
  };

  const getStatusBadge = (status) => {
    const variant =
      status === "confirmed"
        ? "success"
        : status === "pending"
        ? "warning"
        : status === "rejected"
        ? "danger"
        : "secondary";

    return (
      <Badge bg={variant} className="text-capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <Container fluid className="p-0">
      {/* Top Dashboard Header */}
      <div className="dashboard-header text-white p-3 mb-0" >
        <h1 className="mb-0">Admin Dashboard</h1>
      </div>

      <Row className="no-gutters">
        {/* Left Sidebar */}
        <Col md={3} className="left-sidebar text-white" >
          <div className="p-3">
            <h4 className="mb-4">CampusConnect</h4>
            <Nav className="flex-column">
              <Nav.Item>
                <Nav.Link as={Link} to="/maintenance-admin" className="text-white">
                  Maintenance Management
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/bookings-admin" className="text-white">
                  Bookings Management
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/timetable-admin" className="text-white">
                  Timetable Management
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
        </Col>

        {/* Main Content Area */}
        <Col md={9} className="p-4">
          <Card className="shadow-sm rounded">
            <Card.Body>
              <Card.Title className="mb-4">📋 Bookings </Card.Title>
              <p className="text-muted">
                Manage all study room bookings submitted by students and
                lecturers. You can approve or decline pending requests below.
              </p>

              {bookingList.length === 0 ? (
                <Alert variant="info">
                  No bookings available at the moment.
                </Alert>
              ) : (
                <Table striped bordered hover responsive className="mt-3">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Room</th>
                      <th>Purpose</th>
                      <th>Date</th>
                      <th>Requested By</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingList.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.id}</td>
                        <td>{booking.roomId}</td>
                        <td>{booking.purpose}</td>
                        <td>{booking.date}</td>
                        <td>{booking.requestedBy}</td>
                        <td>{getStatusBadge(booking.status)}</td>
                        <td>
                          {booking.status === "pending" ? (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(booking.id, "confirmed")
                                }
                                className="me-2"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(booking.id, "rejected")
                                }
                              >
                                Decline
                              </Button>
                            </>
                          ) : (
                            <span className="text-muted fst-italic">
                              No actions
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingsManagement;
