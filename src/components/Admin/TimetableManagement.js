import React, { useState, useEffect } from "react";
import { Card, Form, Button, Table, Row, Col, Alert, Container, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

const TimetableManagement = () => {
  const [timetable, setTimetable] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [form, setForm] = useState({
    day: "",
    time: "",
    module: "",
    venue: "",
    lecturer: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Define time slots (hourly from 08:00 to 16:00, ending by 17:00)
  const timeSlots = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
  ];

  const fetchTimetable = async () => {
    try {
      const response = await api.get('/admin/timetable');
      setTimetable(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setError('Failed to load timetable');
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get('/admin/rooms');
      setRooms(response.data.data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(prev => prev ? `${prev}; Failed to load rooms` : 'Failed to load rooms');
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await api.get('/admin/lecturers');
      setLecturers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching lecturers:', err);
      setError(prev => prev ? `${prev}; Failed to load lecturers` : 'Failed to load lecturers');
    }
  };

  useEffect(() => {
    fetchTimetable();
    fetchRooms();
    fetchLecturers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitted form:', form); // Debug log
    if (form.day && form.time && form.module && form.venue && form.lecturer) {
      try {
        await api.post('/admin/timetable', form);
        setForm({ day: "", time: "", module: "", venue: "", lecturer: "" });
        setSuccess(true);
        await fetchTimetable();
      } catch (err) {
        console.error('Error adding timetable entry:', err.response?.data || err);
        setError(err.response?.data?.error || 'Failed to add timetable entry');
      }
    } else {
      setError('All fields are required');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
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
              <Card.Title className="mb-4">📅 Timetable</Card.Title>
              <p className="text-muted">Add and view the classroom timetable below (campus closes at 5:00 PM).</p>

              <Form onSubmit={handleSubmit} className="mb-4">
                <Row className="g-3">
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Day</Form.Label>
                      <Form.Control
                        as="select"
                        name="day"
                        value={form.day}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Time</Form.Label>
                      <Form.Control
                        as="select"
                        name="time"
                        value={form.time}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Time</option>
                        {timeSlots.map((slot, index) => (
                          <option key={index} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </Form.Control>
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
                        placeholder="e.g. Mathematics 101"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Venue</Form.Label>
                      <Form.Control
                        as="select"
                        name="venue"
                        value={form.venue}
                        onChange={handleChange}
                        required
                        disabled={rooms.length === 0}
                      >
                        <option value="">Select Venue</option>
                        {rooms.map(room => (
                          <option key={room.id} value={room.name}>
                            {room.name}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Lecturer</Form.Label>
                      <Form.Control
                        as="select"
                        name="lecturer"
                        value={form.lecturer}
                        onChange={handleChange}
                        required
                        disabled={lecturers.length === 0}
                      >
                        <option value="">Select Lecturer</option>
                        {lecturers.map(lecturer => (
                          <option key={lecturer.id} value={lecturer.name}>
                            {lecturer.name}
                          </option>
                        ))}
                      </Form.Control>
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
              {error && <Alert variant="danger">{error}</Alert>}

              <h5 className="mt-4">📘 Current Timetable</h5>
              {loading ? (
                <p>Loading...</p>
              ) : timetable.length === 0 ? (
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