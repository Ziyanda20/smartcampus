import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

function MaintenanceForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    room_id: '',
    description: ''
  });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomLoading, setRoomLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      setError('');
      setRoomLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/booking/rooms', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setRooms(response.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err.response?.data?.error || 'Failed to load rooms');
    } finally {
      setRoomLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/maintenance',
        {
          room_id: formData.room_id,
          description: formData.description
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        onSuccess();
      } else {
        throw new Error(response.data?.error || 'Submission failed');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.error || err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        New Maintenance Request
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {roomLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : rooms.length > 0 ? (
            <FormControl fullWidth required>
              <InputLabel id="room-select-label">Room</InputLabel>
              <Select
                labelId="room-select-label"
                id="room_id"
                value={formData.room_id}
                label="Room"
                onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                required
              >
                {rooms.map(room => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.name} ({room.building})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography color="text.secondary">
              No rooms available. Please try again later.
            </Typography>
          )}
          
          <TextField
            label="Issue Description"
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            fullWidth
            required
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => {
                setFormData({ room_id: '', description: '' });
                setError('');
              }}
              disabled={loading}
            >
              Clear
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={loading || !formData.room_id}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Request'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
}

export default MaintenanceForm;