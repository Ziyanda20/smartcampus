import React, { useState } from "react";
import { Modal, Button, Tabs, Tab, Badge, Spinner, Form } from "react-bootstrap";
import LecturerNavBar from "./LecturerNavBar";

export default function BookingsLecturer() {
  const [key, setKey] = useState("upcoming");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState("study-room");
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [roomNumber, setRoomNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [consultationBookings, setConsultationBookings] = useState([
    {
      id: 1,
      student: "John Doe",
      topic: "Project Discussion",
      date: "2025-05-15",
      time: "14:00 PM",
      status: "Pending",
    },
    {
      id: 2,
      student: "Jane Smith",
      topic: "Assignment Help",
      date: "2025-05-16",
      time: "10:00 AM",
      status: "Pending",
    },
  ]);

  const handleNewBooking = (e) => {
    e.preventDefault();

    const newBooking = {
      id: bookings.length + 1,
      type: bookingType,
      room: roomNumber,
      date: selectedDate,
      time: selectedTime,
      status: "Pending",
    };

    setBookings([...bookings, newBooking]);
    setIsModalOpen(false);

    setRoomNumber("");
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleCancelBooking = (id) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === id ? { ...booking, status: "Cancelled" } : booking
    );
    setBookings(updatedBookings);
  };

  const handleAcceptConsultation = (id) => {
    const updated = consultationBookings.map((booking) =>
      booking.id === id ? { ...booking, status: "Accepted" } : booking
    );
    setConsultationBookings(updated);
  };

  const handleCancelConsultation = (id) => {
    const updated = consultationBookings.map((booking) =>
      booking.id === id ? { ...booking, status: "Cancelled" } : booking
    );
    setConsultationBookings(updated);
  };

  const upcomingBookings = bookings.filter((b) => b.status !== "Cancelled");
  const pastBookings = bookings.filter((b) => b.status === "Cancelled");

  return (
    <>
      <LecturerNavBar />

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
                    <h5>{`Study Room ${booking.room}`}</h5>
                    <p className="mb-1">{booking.date}</p>
                    <small>{booking.time}</small>
                  </div>
                  <div className="text-end">
                    <Badge bg="success" className="mb-2">
                      {booking.status}
                    </Badge>
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
                    <h5>{`Study Room ${booking.room}`}</h5>
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

          <Tab eventKey="consultation" title="Consultation">
            {consultationBookings.length > 0 ? (
              consultationBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded p-3 mb-3 d-flex justify-content-between align-items-center"
                >
                  <div>
                    <h5>{booking.student}</h5>
                    <p className="mb-1">
                      <strong>Topic:</strong> {booking.topic}
                    </p>
                    <p className="mb-1">{booking.date}</p>
                    <small>{booking.time}</small>
                  </div>
                  <div className="text-end">
                    {booking.status !== "Pending" && (
               <Badge
                    bg={booking.status === "Accepted" ? "success" : "secondary"}
                    className="mb-2"
                >
                {booking.status}
               </Badge>
            )}
              {booking.status === "Pending" && (
                <div className="d-flex gap-2">
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => handleAcceptConsultation(booking.id)}
                >
                     Approve
                </Button>
                <Button
                   variant="outline-danger"
                   size="sm"
                   onClick={() => handleCancelConsultation(booking.id)}
                 >
                      Decline
                </Button>
                </div>
            )}
                </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted py-5">
                <p>No consultation bookings</p>
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
                <Form.Label>Booking Type</Form.Label>
                <Form.Select
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value)}
                >
                  <option value="study-room">Study Room</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Room Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter room number"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required
                />
              </Form.Group>

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
                  <option>08:00 AM</option>
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>12:00 PM</option>
                  <option>13:00 PM</option>
                  <option>14:00 PM</option>
                  <option>15:00 PM</option>
                  <option>16:00 PM</option>
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
