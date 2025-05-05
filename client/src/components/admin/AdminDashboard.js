import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  useMediaQuery,
  useTheme,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  MeetingRoom as RoomIcon,
  CalendarToday as CalendarIcon,
  BarChart as AnalyticsIcon,
  ReportProblem as IssuesIcon,
  Menu as MenuIcon,
  ExitToApp as LogoutIcon,
  Check as ApproveIcon,
  Close as RejectIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import components
import UserManagement from './UserManagement';
import LecturerManagement from './LecturerManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import IssueManagement from './IssueManagement';

const drawerWidth = 240;

function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const adminTabs = [
    { label: 'Analytics', icon: <AnalyticsIcon /> },
    { label: 'Bookings', icon: <CalendarIcon /> },
    { label: 'Issues', icon: <IssuesIcon /> },
    { label: 'Users', icon: <PeopleIcon /> },
    { label: 'Lecturers', icon: <PeopleIcon /> }
  ];

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
  
      const [bookingsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/admin/bookings/recent', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
  
      setRecentBookings(bookingsRes.data?.data || []);
      setStats(statsRes.data?.data || {});
      setError(null);
    } catch (error) {
      console.error('Fetch error:', error);
      const errorMsg = error.response?.data?.error || 
                      error.message || 
                      'Failed to load data';
      setError({
        message: errorMsg,
        details: error.response?.data?.details
      });
      showSnackbar(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

 // In AdminDashboard.js
// In AdminDashboard.js
const handleBookingAction = async (bookingId, action) => {
  try {
    setActionLoading(prev => ({ ...prev, [bookingId]: true }));
    const token = localStorage.getItem('token');
    
    const response = await axios.put(
      `http://localhost:5000/admin/bookings/${bookingId}/status`,
      { status: action === 'approve' ? 'approved' : 'rejected' },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    if (response.data.success) {
      showSnackbar(response.data.message, 'success');
      // Optimistically update the UI
      setRecentBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: action === 'approve' ? 'approved' : 'rejected' }
            : booking
        )
      );
    }
  } catch (error) {
    console.error('Booking action error:', error);
    const errorMsg = error.response?.data?.error || 
                   `Failed to ${action} booking`;
    showSnackbar(errorMsg, 'error');
  } finally {
    setActionLoading(prev => ({ ...prev, [bookingId]: false }));
  }
};
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto' }}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}>
          A
        </Avatar>
        <Typography variant="h6">Admin Panel</Typography>
        <Typography variant="body2" color="text.secondary">
          Administrator
        </Typography>
      </Box>
      <Divider />
      <List>
        {adminTabs.map((tab, index) => (
          <ListItem
            button
            key={tab.label}
            selected={tabValue === index}
            onClick={() => {
              handleTabChange(null, index);
              if (isMobile) setMobileOpen(false);
            }}
          >
            <ListItemIcon>{tab.icon}</ListItemIcon>
            <ListItemText primary={tab.label} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3,
          justifyContent: isMobile ? 'space-between' : 'flex-end'
        }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            color="error"
          >
            Logout
          </Button>
        </Box>

        <Container maxWidth="xl">
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message}
              {error.details && <Box sx={{ mt: 1 }}>{error.details}</Box>}
            </Alert>
          )}

          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            {adminTabs[tabValue].label} Management
          </Typography>

          {/* Quick Stats */}
          {tabValue === 0 && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* No cards will be rendered here */}
            </Grid>
          )}

          {/* Tabs */}
          <Paper sx={{ mb: 3, borderRadius: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {adminTabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                  sx={{ minHeight: 64 }}
                />
              ))}
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {tabValue === 0 && <AnalyticsDashboard />}
          {tabValue === 1 && (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white' }}>User</TableCell>
                    <TableCell sx={{ color: 'white' }}>Room</TableCell>
                    <TableCell sx={{ color: 'white' }}>Date</TableCell>
                    <TableCell sx={{ color: 'white' }}>Time</TableCell>
                    <TableCell sx={{ color: 'white' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <TableRow key={booking.id} hover>
                        <TableCell>{booking.username}</TableCell>
                        <TableCell>{booking.room_name}</TableCell>
                        <TableCell>
                          {new Date(booking.booking_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          {booking.start_time} - {booking.end_time}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={booking.status}
                            color={
                              booking.status === 'approved' ? 'success' :
                                booking.status === 'rejected' ? 'error' : 'warning'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {booking.status === 'pending' && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                size="small"
                                color="success"
                                startIcon={<ApproveIcon />}
                                onClick={() => handleBookingAction(booking.id, 'approve')}
                                sx={{ textTransform: 'none' }}
                                disabled={actionLoading[booking.id]}
                              >
                                {actionLoading[booking.id] ? 'Processing...' : 'Approve'}
                              </Button>
                              <Button
                                variant="contained"
                                size="small"
                                color="error"
                                startIcon={<RejectIcon />}
                                onClick={() => handleBookingAction(booking.id, 'reject')}
                                sx={{ textTransform: 'none' }}
                                disabled={actionLoading[booking.id]}
                              >
                                {actionLoading[booking.id] ? 'Processing...' : 'Reject'}
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No recent bookings found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tabValue === 2 && <IssueManagement />}
          {tabValue === 3 && <UserManagement />}
          {tabValue === 4 && <LecturerManagement />}
        </Container>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminDashboard;