import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  Avatar,
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  IconButton,
  Badge,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Menu as MenuIcon,
  ExitToApp as ExitToAppIcon,
  Book as BookIcon,
  Schedule as ScheduleIcon,
  Room as RoomIcon,
  Announcement as AnnouncementIcon,
  Build as BuildIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c387e',
    },
    secondary: {
      main: '#ff7043',
    },
  },
});

function Dashboard() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState({
    name: 'Loading...',
    avatar: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const services = [
    { 
      id: 1, 
      name: 'Class Schedule', 
      icon: <ScheduleIcon color="primary" />, 
      path: '/schedule', 
      description: 'View and manage your class timetable' 
    },
    { 
      id: 2, 
      name: 'Room Booking', 
      icon: <RoomIcon color="primary" />, 
      path: '/booking', 
      description: 'Book study rooms and facilities',
      subItems: [
        { name: 'Available Rooms', path: '/booking' },
        { name: 'My Bookings', path: '/booking?tab=1' }
      ]
    },
    { 
      id: 3, 
      name: 'Maintenance', 
      icon: <BuildIcon color="primary" />, 
      path: '/maintenance', 
      description: 'Report facility issues' 
    },
    { 
      id: 4, 
      name: 'Announcements', 
      icon: <AnnouncementIcon color="primary" />, 
      path: '/announcements', 
      description: 'View campus announcements' 
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
  
        // Verify token first
        const verifyResponse = await axios.get('http://localhost:5000/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        // If verification succeeds, fetch all data
        const responses = await Promise.allSettled([
          axios.get('http://localhost:5000/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/notifications', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/schedule/upcoming', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
  
        // Process responses
        const [userResponse, notificationsResponse, scheduleResponse] = responses;
  
        if (userResponse.status === 'rejected') {
          console.error('User data error:', userResponse.reason);
          throw new Error('Failed to load user data');
        }
  
        setUser({
          name: userResponse.value.data.username,
          role: userResponse.value.data.role
        });
  
        setNotifications(
          notificationsResponse.status === 'fulfilled' 
            ? notificationsResponse.value.data 
            : []
        );
  
        setUpcomingClasses(
          scheduleResponse.status === 'fulfilled' 
            ? scheduleResponse.value.data 
            : []
        );
  
      } catch (err) {
        console.error('Dashboard error:', err);
        
        if (err.response?.status === 401) {
          // Token is invalid/expired
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(err.response?.data?.error || 
                  err.message || 
                  'Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleServiceClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const drawerContent = (
    <>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            margin: 'auto',
            bgcolor: 'secondary.main',
            fontSize: '2.5rem'
          }}
        >
          {user.name.charAt(0)}
        </Avatar>
        <Typography variant="h6" sx={{ mt: 2 }}>{user.name}</Typography>
        <Typography variant="body2">{user.role}</Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      <List>
        {services.map((service) => (
          <ListItem 
            button 
            key={service.id}
            onClick={() => handleServiceClick(service.path)}
            sx={{
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              {service.icon}
            </ListItemIcon>
            <ListItemText primary={service.name} />
          </ListItem>
        ))}
      </List>
    </>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Box
          component="nav"
          sx={{
            width: { md: 240 },
            flexShrink: { md: 0 },
          }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box',
                width: 240,
                bgcolor: 'primary.main',
                color: 'white'
              },
            }}
          >
            {drawerContent}
          </Drawer>

          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box',
                width: 240,
                bgcolor: 'primary.main',
                color: 'white'
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Top App Bar */}
          <AppBar 
            position="static" 
            sx={{ 
              bgcolor: 'white', 
              color: 'text.primary',
              boxShadow: 'none',
              borderBottom: '1px solid rgba(0,0,0,0.12)'
            }}
          >
            <Toolbar>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2, display: { md: 'none' } }}
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Smart Campus Portal
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton color="inherit" sx={{ mr: 1 }}>
                  <Badge badgeContent={notifications.length} color="secondary">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Welcome, {user.name}
                </Typography>
                <IconButton color="inherit" onClick={handleLogout}>
                  <ExitToAppIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Dashboard Content */}
          <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
            <Typography variant="h4" gutterBottom>
              Dashboard Overview
            </Typography>

            {/* Services Grid */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Campus Services
            </Typography>
            <Grid container spacing={3}>
              {services.map((service) => (
                <Grid item xs={12} sm={6} md={3} key={service.id}>
                  <Card sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'scale(1.03)' }
                  }}>
                    <CardActionArea 
                      sx={{ height: '100%' }}
                      onClick={() => handleServiceClick(service.path)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ 
                          width: 60, 
                          height: 60, 
                          bgcolor: 'primary.light', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px'
                        }}>
                          {React.cloneElement(service.icon, { sx: { fontSize: 30 } })}
                        </Box>
                        <Typography variant="h6">{service.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {service.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Upcoming Classes */}
            <Typography variant="h6" sx={{ mt: 6, mb: 2 }}>
              Upcoming Classes
            </Typography>
            <Grid container spacing={3}>
              {upcomingClasses.length > 0 ? (
                upcomingClasses.map((classItem) => (
                  <Grid item xs={12} md={6} key={classItem.id}>
                    <Card sx={{ 
                      bgcolor: 'background.paper',
                      boxShadow: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {classItem.title}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                          {classItem.time}
                        </Typography>
                        <Typography variant="body2">
                          <RoomIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                          {classItem.location}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body1" color="text.secondary">
                    No upcoming classes found
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Quick Actions */}
            <Typography variant="h6" sx={{ mt: 6, mb: 2 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  startIcon={<BookIcon />}
                  sx={{ py: 1.5 }}
                  onClick={() => navigate('/grades')}
                >
                  View Grades
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<ScheduleIcon />}
                  sx={{ py: 1.5 }}
                  onClick={() => navigate('/schedule')}
                >
                  My Schedule
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<RoomIcon />}
                  sx={{ py: 1.5 }}
                  onClick={() => navigate('/booking')}
                >
                  Book Room
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<BuildIcon />}
                  sx={{ py: 1.5 }}
                  onClick={() => navigate('/maintenance')}
                >
                  Report Issue
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard;