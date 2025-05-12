import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
  rejected: 'error'
};

function MaintenanceList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      setError('');
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        'http://localhost:5000/maintenance/my-requests',
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setRequests(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to load requests'
      );
      
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error"
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={fetchRequests}
          >
            Retry
          </Button>
        }
        sx={{ mb: 2 }}
      >
        {error}
      </Alert>
    );
  }

  if (requests.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography>No maintenance requests found</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <List>
        {requests.map((request, index) => (
          <React.Fragment key={request.id}>
            <ListItem>
              <ListItemText
                primary={`${request.room_name} (${request.building})`}
                secondary={
                  <>
                    {request.description}
                    {request.admin_feedback && (
                      <>
                        <br />
                        <strong>Admin Feedback:</strong> {request.admin_feedback}
                      </>
                    )}
                    <br />
                    <small>
                      Submitted: {new Date(request.created_at).toLocaleString()}
                      {request.updated_at && request.updated_at !== request.created_at && 
                        ` • Last updated: ${new Date(request.updated_at).toLocaleString()}`}
                    </small>
                  </>
                }
              />
              <Chip 
                label={request.status.replace('_', ' ')} 
                color={statusColors[request.status] || 'default'}
                sx={{ textTransform: 'capitalize' }}
              />
            </ListItem>
            {index < requests.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}

export default MaintenanceList;