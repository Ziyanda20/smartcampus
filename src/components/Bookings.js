import React, { useState } from "react";
import { Modal, Button, Tabs, Tab, Badge, Spinner, Form } from 'react-bootstrap';
import Navbar from '../components/NavBar';

export default function Bookings() {
  const [key, setKey] = useState('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState('appointment');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [lecturerName, setLecturerName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');

  const handleNewBooking = (e) => {
    e.preventDefault();

    const newBooking = {
      id: bookings.length + 1,
      type: bookingType,
      name:
        bookingType === "appointment"
          ? `Appointment with ${lecturerName}`
          : `Study Room - ${selectedBuilding}`,
      date: selectedDate,
      time: selectedTime,
      endTime: selectedEndTime,
      status: "Pending",
    };

    setBookings([...bookings, newBooking]);
    setIsModalOpen(false);

    // Reset form fields
    setLecturerName('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedBuilding('');
    setSelectedEndTime('');
  };

  const handleCancelBooking = (id) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === id ? { ...booking, status: 'Cancelled' } : booking
    );
    setBookings(updatedBookings);
  };

  const upcomingBookings = bookings.filter(b => b.status !== 'Cancelled');
  const pastBookings = bookings.filter(b => b.status === 'Cancelled');

  return (
    <>
      <Navbar />

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Bookings</h2>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + New Booking
          </Button>
        </div>

        <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
          <Tab eventKey="upcoming" title="Upcoming">
            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded p-3 mb-3 d-flex justify-content-between align-items-center"
                >
                  <div>
                    <h5>{booking.name}</h5>
                    <p className="mb-1">{booking.date}</p>
                    <small>{booking.time}</small>
                  </div>
                  <div className="text-end">
                    <Badge bg="success" className="mb-2">{booking.status}</Badge>
                    <div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted py-5">
                <p>No upcoming bookings</p>
                <Button variant="outline-primary" onClick={() => setIsModalOpen(true)}>
                  + Make a Booking
                </Button>
              </div>
            )}
          </Tab>

          <Tab eventKey="past" title="Past">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded p-3 mb-3 d-flex justify-content-between align-items-center"
                >
                  <div>
                    <h5>{booking.name}</h5>
                    <p className="mb-1">{booking.date}</p>
                    <small>{booking.time}</small>
                  </div>
                  <Badge bg="secondary">{booking.status}</Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-muted py-5">
                <p>No past bookings</p>
              </div>
            )}
          </Tab>
        </Tabs>

        {/* Booking Modal */}
        <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>New Booking</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleNewBooking}>
              <Form.Group className="mb-3">
                <Form.Label>Select Booking Type</Form.Label>
                <Form.Select
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value)}
                >
                  <option value="appointment">Consultation</option>
                  <option value="study-room">Study Room</option>
                </Form.Select>
              </Form.Group>

              {bookingType === "appointment" && (
                <Form.Group className="mb-3">
                  <Form.Label>Lecturer's Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter lecturer's name"
                    value={lecturerName}
                    onChange={(e) => setLecturerName(e.target.value)}
                    required
                  />
                </Form.Group>
              )}

              {bookingType === "study-room" && (
                <Form.Group className="mb-3">
                  <Form.Label>Select Building</Form.Label>
                  <Form.Select
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    required
                  >
                    <option value="">Select building</option>
                    <option>10-138</option>
                    <option>14-1108</option>
                    <option>10-G34</option>
                  </Form.Select>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Select Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Select Time</Form.Label>
                <Form.Select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                >
                  <option value="">Select time</option>
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>12:00 PM</option>
                  <option>13:00 PM</option>
                  <option>14:00 PM</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>End Time</Form.Label>
                <Form.Select
                  value={selectedEndTime}
                  onChange={(e) => setSelectedEndTime(e.target.value)}
                  required
                >
                  <option value="">Select time</option>
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>12:00 PM</option>
                  <option>13:00 PM</option>
                  <option>14:00 PM</option>
                  <option>15:00 PM</option>
                  <option>16:00 PM</option>
                  <option>17:00 PM</option>
                </Form.Select>
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100">
                Confirm Booking
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}
