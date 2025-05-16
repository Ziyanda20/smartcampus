import React, { useState, useEffect } from "react";
import { Card, Button, Table, Badge, Alert, Container, Row, Col, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api"; // Your axios instance configured with baseURL

const BookingsManagement = () => {
  const [bookingList, setBookingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/admin/bookings');
        // Filter to include only room bookings (exclude consultations)
        const roomBookings = response.data.data.filter(
          (booking) => !booking.room_name.includes("Consultation")
        );
        setBookingList(roomBookings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleStatusChange = async (id, newStatus, type) => {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status: newStatus, type });
      setBookingList((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
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
      <div className="dashboard-header text-white p-3 mb-0 d-flex justify-content-between align-items-center">
        <h1 className="mb-0">Admin Dashboard</h1>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Row className="no-gutters">
        <Col md={3} className="left-sidebar text-white">
          <div className="p-3">
            <h4 className="mb-4">CampusConnect</h4>
            <Nav className="flex-column">
              <Nav.Item>
                <Nav.Link as={Link} to="/analytics-page" className="text-white">
                  Back to Dashboard
                </Nav.Link>
              </Nav.Item>
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

        <Col md={9} className="p-4">
          <Card className="shadow-sm rounded">
            <Card.Body>
              <Card.Title className="mb-4">📋 Room Bookings</Card.Title>
              <p className="text-muted">
                Manage all study room bookings submitted by students and lecturers. You can approve or decline pending requests below.
              </p>

              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : bookingList.length === 0 ? (
                <Alert variant="info">No room bookings available at the moment.</Alert>
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
                        <td>{booking.room_name}</td>
                        <td>{booking.purpose}</td>
                        <td>{booking.date}</td>
                        <td>{booking.requested_by}</td>
                        <td>{getStatusBadge(booking.status)}</td>
                        <td>
                          {booking.status === "pending" ? (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(booking.id, "confirmed", "study-room")
                                }
                                className="me-2"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(booking.id, "rejected", "study-room")
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