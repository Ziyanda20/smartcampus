import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, Spin } from '@mui/material';
import RoomList from '../Booking/RoomList'; // Your existing room list component
import BookingForm from '../Booking/BookingForm';
import MyBookings from '../Booking/MyBookings';
import { useAuth } from '../../context/AuthContext';

const LecturerBookingPage = () => {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  if (!user || user.role !== 'lecturer') {
    return <Typography>You do not have access to this page.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} sx={{ mb: 3 }}>
        <Tab label="Available Rooms" />
        <Tab label="My Bookings" />
      </Tabs>

      {tabIndex === 0 && (
        selectedRoom ? (
          <BookingForm 
            room={selectedRoom} 
            onCancel={() => setSelectedRoom(null)} 
            onSuccess={() => {
              setSelectedRoom(null);
              setTabIndex(1); // Switch to bookings tab after success
            }} 
          />
        ) : (
          <RoomList onSelectRoom={setSelectedRoom} />
        )
      )}

      {tabIndex === 1 && <MyBookings />}
    </Box>
  );
};

export default LecturerBookingPage;
