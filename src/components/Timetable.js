import React, { useState, useEffect } from "react";
import { Container, Card, Table, Spinner, Alert } from "react-bootstrap";
import Navbar from "../components/NavBar";
import api from "../api";
import { jwtDecode } from "jwt-decode";

export default function Timetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found - please log in");

        const decoded = jwtDecode(token);
        if (decoded.role.toLowerCase() !== "student") {
          throw new Error("Access denied - student account required");
        }

        const response = await api.get(`/timetable`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTimetable(response.data.data || []);
      } catch (err) {
        console.error("Error fetching timetable:", err.response?.data || err.message);
        setError(
          err.response?.data?.error ||
          err.message ||
          "Failed to fetch timetable"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <Container className="py-5 d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container className="py-5">
        <Card>
          <Card.Header>
            <h5 className="mb-0">Your Timetable</h5>
          </Card.Header>
          <Card.Body>
            {timetable.length === 0 ? (
              <Alert variant="info">No timetable data available</Alert>
            ) : (
              <Table striped bordered hover responsive>
                <thead className="table-primary">
                  <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Module</th>
                    <th>Venue</th>
                    <th>Lecturer</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((item, index) => (
                    <tr key={index}>
                      <td>{item.day}</td>
                      <td>
                        {item.start_time} - {item.end_time}
                      </td>
                      <td>{item.class_name}</td>
                      <td>
                        {item.room_name} ({item.building})
                      </td>
                      <td>{item.lecturer_name}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}