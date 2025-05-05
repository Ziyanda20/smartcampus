import React from "react";
import { Container, Card, Table } from "react-bootstrap";
import Navbar from "../components/NavBar"; // Adjust path as needed

export default function Timetable() {
  return (
    <>
      <Navbar />
      <Container className="py-5">
        <Card>
          <Card.Header>
            <h5 className="mb-0">Your Timetable</h5>
          </Card.Header>
          <Card.Body>
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
                <tr>
                  <td>Monday</td>
                  <td>08:00 - 10:00</td>
                  <td>Software Engineering</td>
                  <td>Room A101</td>
                  <td>Mr. Dlamini</td>
                </tr>
                <tr>
                  <td>Tuesday</td>
                  <td>10:00 - 12:00</td>
                  <td>Database Systems</td>
                  <td>Room B202</td>
                  <td>Ms. Naidoo</td>
                </tr>
                <tr>
                  <td>Wednesday</td>
                  <td>13:00 - 15:00</td>
                  <td>Networking</td>
                  <td>Room C303</td>
                  <td>Mr. Mokoena</td>
                </tr>
                {/* Add more rows as needed */}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
