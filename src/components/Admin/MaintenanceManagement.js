import React, { useState } from "react";
import {Card,Table,Badge,Alert,Dropdown,Container,Row,Col,Nav,} from "react-bootstrap";
import { Link } from "react-router-dom";

// Dummy data for maintenance requests
const dummyRequests = [
  {
    id: 1,
    location: "Block A - Room 204",
    issue: "Broken window",
    dateReported: "2025-05-10",
    status: "pending",
    requestedBy: "Student - Zanele M",
  },
  {
    id: 2,
    location: "Library - 2nd Floor",
    issue: "Leaking ceiling",
    dateReported: "2025-05-08",
    status: "in progress",
    requestedBy: "Lecturer - Mr. Khumalo",
  },
  {
    id: 3,
    location: "Admin Office",
    issue: "Air conditioner not working",
    dateReported: "2025-05-07",
    status: "completed",
    requestedBy: "Admin - Ms. Molefe",
  },
  {
    id: 4,
    location: "Cafeteria",
    issue: "Faulty light switch",
    dateReported: "2025-05-09",
    status: "pending",
    requestedBy: "Student - Themba D",
  },
];

const MaintenanceManagement = ({ requests = dummyRequests }) => {
  const [maintenanceList, setMaintenanceList] = useState(requests);

  const handleStatusChange = (id, newStatus) => {
    const updated = maintenanceList.map((req) =>
      req.id === id ? { ...req, status: newStatus } : req
    );
    setMaintenanceList(updated);
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
              <Card.Title className="mb-4">🛠️ Maintenance </Card.Title>
              <p className="text-muted">
                Below are all submitted maintenance requests. You can update the status to reflect the current progress.
              </p>

              {maintenanceList.length === 0 ? (
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
                        <td>{req.dateReported}</td>
                        <td>{req.requestedBy}</td>
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
