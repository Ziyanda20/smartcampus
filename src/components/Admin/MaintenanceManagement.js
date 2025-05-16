import React, { useState, useEffect } from "react";
import { Card, Table, Badge, Alert, Dropdown, Container, Row, Col, Nav, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api"; // Your axios instance configured with baseURL

const MaintenanceManagement = () => {
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaintenanceRequests = async () => {
      try {
        const response = await api.get('/admin/maintenance');
        setMaintenanceList(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching maintenance requests:', err);
        setError('Failed to load maintenance requests');
        setLoading(false);
      }
    };

    fetchMaintenanceRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/admin/maintenance/${id}/status`, { status: newStatus });
      setMaintenanceList((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
      );
    } catch (err) {
      console.error('Error updating maintenance request status:', err);
      setError('Failed to update maintenance request status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const getStatusBadge = (status) => {
    const variant =
      status === "completed"
        ? "success"
        : status === "in progress"
        ? "info"
        : status === "pending"
        ? "warning"
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
              <Card.Title className="mb-4">🛠️ Maintenance</Card.Title>
              <p className="text-muted">
                Below are all submitted maintenance requests. You can update the status to reflect the current progress.
              </p>

              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : maintenanceList.length === 0 ? (
                <Alert variant="info">No maintenance requests at the moment.</Alert>
              ) : (
                <Table striped bordered hover responsive className="mt-3">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Location</th>
                      <th>Issue</th>
                      <th>Date Reported</th>
                      <th>Requested By</th>
                      <th>Status</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceList.map((req) => (
                      <tr key={req.id}>
                        <td>{req.id}</td>
                        <td>{req.location}</td>
                        <td>{req.issue}</td>
                        <td>{new Date(req.date_reported).toLocaleDateString()}</td>
                        <td>{req.requested_by}</td>
                        <td>{getStatusBadge(req.status)}</td>
                        <td>
                          <Dropdown onSelect={(status) => handleStatusChange(req.id, status)}>
                            <Dropdown.Toggle variant="secondary" size="sm">
                              Change Status
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item eventKey="pending">Pending</Dropdown.Item>
                              <Dropdown.Item eventKey="in progress">In Progress</Dropdown.Item>
                              <Dropdown.Item eventKey="completed">Completed</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
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

export default MaintenanceManagement;