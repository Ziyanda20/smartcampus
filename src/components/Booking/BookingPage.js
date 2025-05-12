import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Tabs, 
  Tab,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Book as BookIcon,
  Schedule as ScheduleIcon,
  Room as RoomIcon,
  Build as BuildIcon,
  Notifications as NotificationsIcon,
  ExitToApp as ExitToAppIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import RoomList from './RoomList';
import BookingForm from './BookingForm';
import MyBookings from './MyBookings';
import Sidebar from '../Sidebar'; // You'll need to create this or use your existing one

function BookingPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedRoom(null);
    setBookingSuccess(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (bookingSuccess) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
        
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Container maxWidth="lg">
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Booking Successful!
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => {
                  setSelectedRoom(null);
                  setBookingSuccess(false);
                  setTabValue(1);
                }}
                sx={{ mt: 2 }}
              >
                View My Bookings
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSelectedRoom(null);
                  setBookingSuccess(false);
                }}
                sx={{ mt: 2, ml: 2 }}
              >
                Book Another Room
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Available Rooms" icon={<RoomIcon />} iconPosition="start" />
              <Tab label="My Bookings" icon={<BookIcon />} iconPosition="start" />
            </Tabs>
          </Box>
          
          {tabValue === 0 ? (
            selectedRoom ? (
              <BookingForm 
                room={selectedRoom} 
                onCancel={() => setSelectedRoom(null)}
                onSuccess={() => setBookingSuccess(true)}
              />
            ) : (
              <RoomList onSelectRoom={setSelectedRoom} />
            )
          ) : (
            <MyBookings />
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default BookingPage;