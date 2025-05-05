import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Box
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Room as RoomIcon,
  Build as BuildIcon,
  Announcement as AnnouncementIcon,
  ExitToApp as ExitToAppIcon,
  Dashboard as DashboardIcon, // Added Dashboard Icon
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const services = [
  { id: 1, name: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' }, // Added Dashboard
  { id: 2, name: 'Class Schedule', icon: <ScheduleIcon />, path: '/schedule' },
  { id: 3, name: 'Room Booking', icon: <RoomIcon />, path: '/booking' },
  { id: 4, name: 'Maintenance', icon: <BuildIcon />, path: '/maintenance' },
  { id: 5, name: 'Announcements', icon: <AnnouncementIcon />, path: '/announcements' }
];

export default function Sidebar({ mobileOpen, handleDrawerToggle }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleServiceClick = (path) => {
    navigate(path);
    if (isMobile) handleDrawerToggle();
  };

  const drawerContent = (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={handleDrawerToggle}>
          {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List>
        {services.map((service) => (
          <ListItem
            button
            key={service.id}
            onClick={() => handleServiceClick(service.path)}
          >
            <ListItemIcon>{service.icon}</ListItemIcon>
            <ListItemText primary={service.name} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={() => {
          localStorage.removeItem('token');
          navigate('/login');
        }}>
          <ListItemIcon><ExitToAppIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? mobileOpen : true}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
