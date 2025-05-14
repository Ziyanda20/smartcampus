import React, { useState } from "react";
import { Card, Form, Button, Table, Row, Col, Alert, Container,Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

const TimetableManagement = () => {
  const [timetable, setTimetable] = useState([]);
  const [form, setForm] = useState({
    day: "",
    time: "",
    module: "",
    venue: "",
    lecturer: "",
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      form.day && form.time && form.module &&
      form.venue && form.lecturer
    ) {
      setTimetable([...timetable, { ...form, id: Date.now() }]);
      setForm({ day: "", time: "", module: "", venue: "", lecturer: "" });
      setSuccess(true);
    }
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
              <Card.Title className="mb-4">📅 Timetable </Card.Title>
              <p className="text-muted">Add and view the classroom timetable below.</p>

              <Form onSubmit={handleSubmit} className="mb-4">
                <Row className="g-3">
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Day</Form.Label>
                      <Form.Control
                        type="text"
                        name="day"
                        value={form.day}
                        onChange={handleChange}
                        placeholder="e.g. Monday"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Time</Form.Label>
                      <Form.Control
                        type="text"
                        name="time"
                        value={form.time}
                        onChange={handleChange}
                        placeholder="e.g. 10:00 - 12:00"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Module</Form.Label>
                      <Form.Control
                        type="text"
                        name="module"
                        value={form.module}
                        onChange={handleChange}
                        placeholder="e.g. COS101"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Venue</Form.Label>
                      <Form.Control
                        type="text"
                        name="venue"
                        value={form.venue}
                        onChange={handleChange}
                        placeholder="e.g. Lab 2.1"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Lecturer</Form.Label>
                      <Form.Control
                        type="text"
                        name="lecturer"
                        value={form.lecturer}
                        onChange={handleChange}
                        placeholder="e.g. Mr. Dlamini"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="mt-3">
                  <Button type="submit" variant="primary">
                    Add Timetable Entry
                  </Button>
                </div>
              </Form>

              {success && <Alert variant="success">Timetable entry added successfully!</Alert>}

              <h5 className="mt-4">📘 Current Timetable</h5>
              {timetable.length === 0 ? (
                <p className="text-muted">No timetable entries posted yet.</p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Module</th>
                      <th>Venue</th>
                      <th>Lecturer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetable.map((entry, index) => (
                      <tr key={entry.id}>
                        <td>{index + 1}</td>
                        <td>{entry.day}</td>
                        <td>{entry.time}</td>
                        <td>{entry.module}</td>
                        <td>{entry.venue}</td>
                        <td>{entry.lecturer}</td>
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

export default TimetableManagement;
