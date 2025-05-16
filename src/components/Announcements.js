import React, { useState, useEffect } from "react";
import { Container, Card, Tabs, Tab, ListGroup, Spinner, Alert } from "react-bootstrap";
import NavBar from "../components/NavBar";
import api from "../api";
import { jwtDecode } from 'jwt-decode';

export default function Announcements() {
  const [key, setKey] = useState("all");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("You are not logged in");
        }
        
        const decoded = jwtDecode(token);
        console.log("Decoded userId:", decoded.id); // Debug log
        const response = await api.get(`/announcements?userId=${decoded.id}`);
        console.log("Announcements response:", response.data.data); // Debug log
        setAnnouncements(response.data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/announcements/${id}/read`);
      setAnnouncements(announcements.map(ann => 
        ann.id === id ? { ...ann, is_read: 1 } : ann
      ));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const filterAnnouncements = (type) => {
    if (type === "all") return announcements; // Shows all notifications for the logged-in user
    if (type === "unread") return announcements.filter(a => !a.is_read);
    return announcements.filter(a => a.type === type);
  };

  const renderList = (items) => (
    <ListGroup variant="flush">
      {items.length > 0 ? (
        items.map((item) => (
          <ListGroup.Item 
            key={item.id} 
            action 
            onClick={() => markAsRead(item.id)}
            className={!item.is_read ? "fw-bold" : ""}
          >
            <strong>{item.title}</strong>
            <div className="text-muted" style={{ fontSize: "0.9rem" }}>
              {new Date(item.created_at).toLocaleDateString()} - {item.sender_name || 'System'}
            </div>
            <div>{item.message}</div>
          </ListGroup.Item>
        ))
      ) : (
        <ListGroup.Item>
          <p className="text-muted text-center">No announcements available.</p>
        </ListGroup.Item>
      )}
    </ListGroup>
  );

  if (loading) return (
    <>
      <NavBar />
      <Container className="py-4">
        <Spinner animation="border" />
      </Container>
    </>
  );

  if (error) return (
    <>
      <NavBar />
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    </>
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
              <Tab eventKey="unread" title="Unread">
                {renderList(filterAnnouncements("unread"))}
              </Tab>
              <Tab eventKey="system" title="System">
                {renderList(filterAnnouncements("system"))}
              </Tab>
              <Tab eventKey="study-room" title="Study Rooms">
                {renderList(filterAnnouncements("study-room"))}
              </Tab>
              <Tab eventKey="maintenance" title="Maintenance">
                {renderList(filterAnnouncements("maintenance"))}
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}