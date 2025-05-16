import React, { useState, useEffect } from "react";
import { Modal, Button, Badge, Table, Tabs, Tab, Form, Spinner, Alert } from "react-bootstrap";
import NavBar from "../components/NavBar";
import api from "../api";
import { jwtDecode } from "jwt-decode";

export default function Bookings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [key, setKey] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState({
    main: false,
    form: false,
    rooms: false,
    lecturers: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [bookingType, setBookingType] = useState("study-room");

  const [formData, setFormData] = useState({
    roomId: "",
    lecturerId: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, main: true }));
        const token = localStorage.getItem("token");
        if (!token) throw new Error("You are not logged in");

        const decoded = jwtDecode(token);

        // Fetch bookings
        const bookingsRes = await api.get(`/bookings?userId=${decoded.id}`);
        console.log("Bookings response:", bookingsRes.data); // Debug the response
        setBookings(bookingsRes.data.data || []);

        // Fetch rooms
        setLoading(prev => ({ ...prev, rooms: true }));
        const roomsRes = await api.get('/rooms');
        setRooms(roomsRes.data.data || []);

        // Fetch lecturers
        setLoading(prev => ({ ...prev, lecturers: true }));
        const lecturersRes = await api.get('/lecturers');
        console.log("Lecturers response:", lecturersRes.data);
        setLecturers(lecturersRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.details || err.response?.data?.error || err.message || 'Failed to fetch data');
      } finally {
        setLoading(prev => ({ ...prev, main: false, rooms: false, lecturers: false }));
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(prev => ({ ...prev, form: true }));
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You are not logged in");

      const decoded = jwtDecode(token);

      const payload = {
        userId: decoded.id,
        type: bookingType,
        ...formData
      };

      const response = await api.post('/bookings', payload);

      setSuccess('Booking created successfully');
      setIsModalOpen(false);
      setFormData({
        roomId: "",
        lecturerId: "",
        bookingDate: "",
        startTime: "",
        endTime: "",
        purpose: ""
      });

      // Refresh bookings
      const bookingsRes = await api.get(`/bookings?userId=${decoded.id}`);
      setBookings(bookingsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.details || err.response?.data?.error || err.message || 'Failed to create booking');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleCancelBooking = async (id, type) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      setLoading(prev => ({ ...prev, form: true }));
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You are not logged in");

      await api.delete(`/bookings/${id}?type=${type}`);
      setSuccess('Booking deleted successfully');

      const decoded = jwtDecode(token);
      const bookingsRes = await api.get(`/bookings?userId=${decoded.id}`);
      setBookings(bookingsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.details || err.response?.data?.error || err.message || 'Failed to cancel booking');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  // Filter bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter(b => {
    const bookingDate = new Date(b.booking_date || b.appointment_time);
    return bookingDate >= today;
  });

  const pastBookings = bookings.filter(b => {
    const bookingDate = new Date(b.booking_date || b.appointment_time);
    return bookingDate < today;
  });

  const renderTable = (bookings, showActions = true) => (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Type</th>
          <th>Details</th>
          <th>Date</th>
          <th>Time</th>
          <th>Purpose</th>
          <th>Status</th>
          {showActions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {bookings.map((booking) => (
          <tr key={booking.id}>
            <td>
              <Badge bg={booking.type === "study-room" ? "info" : "primary"}>
                {booking.type === "study-room" ? "Room" : "Consultation"}
              </Badge>
            </td>
            <td>
              {booking.type === "study-room"
                ? `${booking.room_name || 'Unknown'} (${booking.building || 'N/A'})`
                : `With ${booking.lecturer_name || 'Unknown'}`}
            </td>
            <td>
              {new Date(booking.booking_date || booking.appointment_time).toLocaleDateString()}
            </td>
            <td>
              {booking.start_time && booking.end_time
                ? `${booking.start_time.slice(0, 5)} - ${booking.end_time.slice(0, 5)}` // Slice to show only HH:MM
                : booking.appointment_time
                  ? new Date(booking.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'N/A'}
            </td>
            <td>{booking.purpose || 'N/A'}</td>
            <td>
              <Badge bg={
                booking.status === "approved" ? "success" :
                booking.status === "pending" ? "warning" :
                booking.status === "rejected" ? "danger" :
                "secondary"
              }>
                {booking.status}
              </Badge>
            </td>
            {showActions && (
              <td>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleCancelBooking(booking.id, booking.type)}
                  disabled={loading.form}
                >
                  Cancel
                </Button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <>
      <NavBar />
      <div className="container mt-4">
        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

        <div className="d-flex justify-content-end mb-3">
          <Button variant="primary" onClick={() => setIsModalOpen(true)} disabled={loading.main}>
            {loading.main ? <Spinner size="sm" /> : '+ New Booking'}
          </Button>
        </div>

        {loading.main ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
            <Tab eventKey="upcoming" title="Upcoming">
              {upcomingBookings.length > 0 ? (
                renderTable(upcomingBookings)
              ) : (
                <div className="text-center text-muted py-4">
                  <p>No upcoming bookings.</p>
                  <Button variant="outline-primary" onClick={() => setIsModalOpen(true)}>
                    Create a Booking
                  </Button>
                </div>
              )}
            </Tab>
            <Tab eventKey="past" title="Past">
              {pastBookings.length > 0 ? (
                renderTable(pastBookings, false)
              ) : (
                <div className="text-center text-muted py-4">
                  <p>No past bookings.</p>
                </div>
              )}
            </Tab>
          </Tabs>
        )}

        <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>New Booking</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Booking Type</Form.Label>
                <Form.Select
                  value={bookingType}
                  onChange={(e) => {
                    setBookingType(e.target.value);
                    setFormData(prev => ({ ...prev, roomId: "", lecturerId: "" }));
                  }}
                  disabled={loading.form}
                >
                  <option value="study-room">Study Room</option>
                  <option value="consultation">Consultation</option>
                </Form.Select>
              </Form.Group>

              {bookingType === "study-room" ? (
                <Form.Group className="mb-3">
                  <Form.Label>Room</Form.Label>
                  <Form.Select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleInputChange}
                    disabled={loading.form || loading.rooms}
                    required
                    className="form-select-custom"
                  >
                    <option value="">Select a room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} - {room.building}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              ) : (
                <Form.Group className="mb-3">
                  <Form.Label>Lecturer</Form.Label>
                  <Form.Select
                    name="lecturerId"
                    value={formData.lecturerId}
                    onChange={handleInputChange}
                    disabled={loading.form || loading.lecturers}
                    required
                    className="form-select-custom"
                  >
                    <option value="">Select a lecturer</option>
                    {lecturers.map(lecturer => (
                      <option key={lecturer.id} value={lecturer.id}>
                        {lecturer.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Booking Date</Form.Label>
                <Form.Control
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </Form.Group>

              <div className="row">
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Purpose</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="Describe the purpose of your booking"
                  required
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading.form}>
              {loading.form ? <Spinner size="sm" /> : 'Submit'}
            </Button>
          </Modal.Footer>
        </Modal>

        <style jsx>{`
          .form-select-custom {
            color: #212529 !important;
            background-color: #fff !important;
          }
          .form-select-custom option {
            color: #212529 !important;
            background-color: #fff !important;
          }
        `}</style>
      </div>
    </>
  );
}