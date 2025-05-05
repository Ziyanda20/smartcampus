import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/booking/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchBookings(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.error || 'Cancellation failed. Please try again.');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchBookings} sx={{ ml: 2 }}>Retry</Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        My Bookings
      </Typography>
      
      {bookings.length === 0 ? (
        <Typography variant="body1">You have no bookings yet.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Room</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.room_name} ({booking.building})</TableCell>
                  <TableCell>{format(new Date(booking.booking_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    {booking.start_time} - {booking.end_time}
                  </TableCell>
                  <TableCell>{booking.purpose || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={booking.status} 
                      color={
                        booking.status === 'approved' ? 'success' : 
                        booking.status === 'rejected' ? 'error' : 'warning'
                      } 
                    />
                  </TableCell>
                  <TableCell>
                    {booking.status === 'pending' && (
                      <Button 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleCancel(booking.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default MyBookings;