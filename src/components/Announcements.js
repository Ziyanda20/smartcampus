import React, { useState } from "react";
import { Container, Card, Tabs, Tab, ListGroup } from "react-bootstrap";
import NavBar from "../components/NavBar"; // Adjust the path if necessary

// Mock announcement data
const mockAnnouncements = [
  { id: 1, title: "Exam Schedule Released", type: "important", date: "2025-04-20" },
  { id: 2, title: "Campus Clean-Up Drive", type: "recent", date: "2025-04-25" },
  { id: 3, title: "Holiday Notice", type: "important", date: "2025-04-10" },
  { id: 4, title: "Library Hours Extended", type: "recent", date: "2025-04-27" },
  { id: 5, title: "General Update", type: "general", date: "2025-04-15" },
];

export default function Announcements() {
  const [key, setKey] = useState("all");

  const filterAnnouncements = (type) => {
    if (type === "all") return mockAnnouncements;
    return mockAnnouncements.filter((item) => item.type === type);
  };

  const renderList = (items) => (
    <ListGroup variant="flush">
      {items.map((item) => (
        <ListGroup.Item key={item.id}>
          <strong>{item.title}</strong>
          <div className="text-muted" style={{ fontSize: "0.9rem" }}>{item.date}</div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );

  return (
    <>
      <NavBar />
      <Container className="py-4">
        <h2 className="mb-4">Announcements</h2>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Select Category</h5>
          </Card.Header>
          <Card.Body>
            <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3" justify>
              <Tab eventKey="all" title="All">
                {renderList(filterAnnouncements("all"))}
              </Tab>
              <Tab eventKey="important" title="Important">
                {renderList(filterAnnouncements("important"))}
              </Tab>
              <Tab eventKey="recent" title="Recent">
                {renderList(filterAnnouncements("recent"))}
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
