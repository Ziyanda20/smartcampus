import React, { useState, useEffect } from "react";
import { Modal, Button, Badge, Table, Tabs, Tab, Form, Spinner, Alert } from "react-bootstrap";
import NavBar from "../components/NavBar";
import api from "../api";
import { jwtDecode } from "jwt-decode";

const getBadgeVariant = (priority) => {
  switch (priority.toLowerCase()) {
    case "low": return "primary";
    case "medium": return "warning";
    case "high": return "danger";
    case "critical": return "dark";
    default: return "secondary";
  }
};

export default function Maintenance() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [key, setKey] = useState("active");
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    roomId: "",
    description: "",
    priority: "medium",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("You are not logged in");
        
        const decoded = jwtDecode(token);
        
        // Fetch requests
        const requestsRes = await api.get(`/maintenance?userId=${decoded.id}`);
        setRequests(requestsRes.data.data);
        
        // Fetch rooms
        const roomsRes = await api.get('/rooms');
        setRooms(roomsRes.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
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
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You are not logged in");
      
      const decoded = jwtDecode(token);
      
      await api.post('/maintenance', {
        userId: decoded.id,
        roomId: formData.roomId,
        description: formData.description,
        priority: formData.priority
      });
      
      setSuccess('Maintenance request submitted successfully');
      setIsModalOpen(false);
      
      // Refresh requests
      const requestsRes = await api.get(`/maintenance?userId=${decoded.id}`);
      setRequests(requestsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeRequests = requests.filter(
    (r) => r.status === "pending" || r.status === "in_progress"
  );
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const completedRequests = requests.filter((r) => r.status === "completed");

  const renderTable = (requests, showCompletion = false) => (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Building</th>
          <th>Room</th>
          <th>Description</th>
          <th>Priority</th>
          <th>Submitted</th>
          {showCompletion ? <th>Completed</th> : <th>Status</th>}
          {showCompletion && <th>Admin Feedback</th>}
        </tr>
      </thead>
      <tbody>
        {requests.map((req) => (
          <tr key={req.id}>
            <td>{req.building || 'N/A'}</td>
            <td>{req.room_name || 'N/A'}</td>
            <td>{req.description}</td>
            <td>
              <Badge bg={getBadgeVariant(req.priority)}>{req.priority}</Badge>
            </td>
            <td>{new Date(req.created_at).toLocaleDateString()}</td>
            {showCompletion ? (
              <>
                <td>{req.updated_at ? new Date(req.updated_at).toLocaleDateString() : "N/A"}</td>
                <td>{req.admin_feedback || 'N/A'}</td>
              </>
            ) : (
              <td>
                <Badge bg="secondary">{req.status.replace('_', ' ')}</Badge>
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
          <Button variant="primary" onClick={() => setIsModalOpen(true)} disabled={loading}>
            {loading ? <Spinner size="sm" /> : '+ Request Maintenance'}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
            <Tab eventKey="active" title="Active">
              {activeRequests.length > 0 ? (
                renderTable(activeRequests)
              ) : (
                <div className="text-center text-muted py-4">
                  <p>No active maintenance requests.</p>
                  <Button variant="outline-primary" onClick={() => setIsModalOpen(true)}>
                    Submit a Request
                  </Button>
                </div>
              )}
            </Tab>
            <Tab eventKey="pending" title="Pending">
              {pendingRequests.length > 0 ? (
                renderTable(pendingRequests)
              ) : (
                <div className="text-center text-muted py-4">
                  <p>No pending maintenance requests.</p>
                  <Button variant="outline-primary" onClick={() => setIsModalOpen(true)}>
                    Submit a Request
                  </Button>
                </div>
              )}
            </Tab>
            <Tab eventKey="completed" title="Completed">
              {completedRequests.length > 0 ? (
                renderTable(completedRequests, true)
              ) : (
                <div className="text-center text-muted py-4">
                  <p>No completed maintenance requests.</p>
                </div>
              )}
            </Tab>
          </Tabs>
        )}

        {/* Modal with Form */}
        <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Submit Maintenance Request</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Room (optional)</Form.Label>
                <Form.Select
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select a Room --</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} - {room.building}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the issue in detail"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Submit'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}