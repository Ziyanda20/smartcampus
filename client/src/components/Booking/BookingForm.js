import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Stack,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import axios from 'axios';

function BookingForm({ room, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    bookingDate: new Date(),
    startTime: null,
    endTime: null,
    purpose: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/booking', {
        room_id: room.id,
        booking_date: formData.bookingDate.toISOString().split('T')[0],
        start_time: formData.startTime.toTimeString().substring(0, 5),
        end_time: formData.endTime.toTimeString().substring(0, 5),
        purpose: formData.purpose
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Booking {room.name}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <DateTimePicker
            label="Start Time"
            value={formData.startTime}
            onChange={(newValue) => setFormData({...formData, startTime: newValue})}
            renderInput={(params) => <TextField {...params} fullWidth required />}
          />
          <DateTimePicker
            label="End Time"
            value={formData.endTime}
            onChange={(newValue) => setFormData({...formData, endTime: newValue})}
            renderInput={(params) => <TextField {...params} fullWidth required />}
            minDateTime={formData.startTime}
          />
          <TextField
            label="Purpose"
            multiline
            rows={3}
            value={formData.purpose}
            onChange={(e) => setFormData({...formData, purpose: e.target.value})}
            fullWidth
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="contained">Submit Booking</Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
}

export default BookingForm;