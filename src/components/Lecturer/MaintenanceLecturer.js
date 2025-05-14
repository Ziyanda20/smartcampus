import React, { useState } from "react";
import { Modal, Button, Badge, Table, Tabs, Tab, Form } from "react-bootstrap";
import LecturerNavBar from "./LecturerNavBar";

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

const getBadgeVariant = (priority) => {
  switch (priority.toLowerCase()) {
    case "low":
      return "primary";
    case "medium":
      return "warning";
    case "high":
      return "danger";
    case "critical":
      return "dark";
    default:
      return "secondary";
  }
};

export default function Maintenance() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [key, setKey] = useState("active");

  const [requests, setRequests] = useState([
    {
      id: 1,
      location: "Room 101",
      building: "Building A",
      issueType: "Leaking tap",
      priority: "High",
      status: "pending",
      submitDate: "2024-04-10",
      completionDate: null,
    },
    {
      id: 2,
      location: "Lab A",
      building: "Building B",
      issueType: "Broken projector",
      priority: "Critical",
      status: "completed",
      submitDate: "2024-03-28",
      completionDate: "2024-04-01",
    },
    {
      id: 3,
      location: "Library",
      building: "Building C",
      issueType: "Aircon not working",
      priority: "Medium",
      status: "in-progress",
      submitDate: "2024-04-15",
      completionDate: null,
    },
  ]);

  const [formData, setFormData] = useState({
    location: "",
    building: "Building A",
    issueType: "",
    priority: "Low",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const newRequest = {
      id: Date.now(),
      location: formData.location,
      building: formData.building,
      issueType: formData.issueType,
      priority: formData.priority,
      status: "pending",
      submitDate: new Date().toISOString(),
      completionDate: null,
    };
    setRequests((prev) => [newRequest, ...prev]);
    setFormData({ location: "", building: "Building A", issueType: "", priority: "Low" });
    setIsModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const activeRequests = requests.filter(
    (r) => r.status === "pending" || r.status === "in-progress"
  );
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const completedRequests = requests.filter((r) => r.status === "completed");

  const renderTable = (requests, showCompletion = false) => (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Location</th>
          <th>Building</th>
          <th>Issue Type</th>
          <th>Priority</th>
          <th>Submitted</th>
          {showCompletion ? <th>Completed</th> : <th>Status</th>}
        </tr>
      </thead>
      <tbody>
        {requests.map((req) => (
          <tr key={req.id}>
            <td>{req.location}</td>
            <td>{req.building}</td>
            <td>{req.issueType}</td>
            <td>
              <Badge bg={getBadgeVariant(req.priority)}>{req.priority}</Badge>
            </td>
            <td>{formatDate(req.submitDate)}</td>
            {showCompletion ? (
              <td>{req.completionDate ? formatDate(req.completionDate) : "N/A"}</td>
            ) : (
              <td>
                <Badge bg="secondary">{req.status}</Badge>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <>
      <LecturerNavBar />

      <div className="container mt-4">
        <h2 className="mb-4">Maintenance Requests</h2>

        {showSuccess && (
          <div className="alert alert-success" role="alert">
            Maintenance request submitted successfully!
          </div>
        )}

        <div className="d-flex justify-content-end mb-3">
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + Request Maintenance
          </Button>
        </div>

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

        {/* Modal with Form */}
        <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Submit Maintenance Request</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Building</Form.Label>
                <Form.Select
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                >
                  <option>10-138</option>
                  <option>10-LG66</option>
                  <option>13-G33</option>
                  <option>14-1107</option>
                  
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Issue Type</Form.Label>
                <Form.Control
                  type="text"
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleInputChange}
                  placeholder="Describe the issue"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}
