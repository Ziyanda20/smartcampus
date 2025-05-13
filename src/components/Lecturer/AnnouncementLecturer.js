import React, { useState } from "react";
import { Container, Form, Button, Card, ListGroup } from "react-bootstrap";
import LecturerNavBar from "./LecturerNavBar";

export default function AnnouncementLecturer() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("important");
  const [date, setDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date) {
      alert("Please fill in all fields.");
      return;
    }

    const newAnnouncement = {
      id: announcements.length + 1,
      title,
      type,
      date,
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setTitle("");
    setType("important");
    setDate("");
  };

  return (
    <>
      <LecturerNavBar />
      <Container className="py-4">
        <h2 className="mb-4">Post a New Announcement</h2>
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter announcement title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formType">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="important">Important</option>
                  <option value="recent">Recent</option>
                  <option value="general">General</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDate">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Post Announcement
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {announcements.length > 0 && (
          <Card>
            <Card.Header>Posted Announcements</Card.Header>
            <ListGroup variant="flush">
              {announcements.map((item) => (
                <ListGroup.Item key={item.id}>
                  <strong>{item.title}</strong>
                  <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                    {item.date} ({item.type})
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        )}
      </Container>
    </>
  );
}
