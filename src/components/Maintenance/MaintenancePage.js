import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Tabs, 
  Tab,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  Build as BuildIcon,
  List as ListIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

import Sidebar from '../Sidebar';

function MaintenancePage() {
  const [tabValue, setTabValue] = useState(0);
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [requests, setRequests] = useState([
    { id: 1, room: 'Room 101', issue: 'Broken projector', status: 'Pending', date: '2025-05-01' },
    { id: 2, room: 'Room 205', issue: 'Leaking ceiling', status: 'In Progress', date: '2025-05-02' }
  ]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRequest = {
      id: requests.length + 1,
      room: room,
      issue: description,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };
    setRequests([...requests, newRequest]);
    setRoom('');
    setDescription('');
    setTabValue(0); // Switch to My Requests tab after submission
  };

  const handleCancelRequest = (id) => {
    setRequests(requests.filter(request => request.id !== id));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Maintenance Requests
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Box sx={{ p: 3, mt: 8 }}>
          <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ mb: 3 }}
              >
                <Tab label="MY REQUESTS" icon={<ListIcon />} />
                <Tab label="REPORT NEW ISSUE" icon={<AddIcon />} />
              </Tabs>
              
              {tabValue === 0 ? (
                <Box>
                  <List>
                    {requests.map((request) => (
                      <React.Fragment key={request.id}>
                        <ListItem>
                          <ListItemText
                            primary={request.room}
                            secondary={
                              <>
                                {request.issue}
                                <br />
                                <small>Submitted: {request.date}</small>
                              </>
                            }
                          />
                          <Chip 
                            label={request.status} 
                            color={
                              request.status === 'Pending' ? 'warning' :
                              request.status === 'In Progress' ? 'info' : 'success'
                            }
                          />
                          <IconButton 
                            onClick={() => handleCancelRequest(request.id)}
                            color="error"
                            sx={{ ml: 1 }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    New Maintenance Request
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 3 }} required>
                    <InputLabel>Room *</InputLabel>
                    <Select
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      label="Room *"
                    >
                      <MenuItem value="Room 101">Room 101</MenuItem>
                      <MenuItem value="Room 205">Room 205</MenuItem>
                      <MenuItem value="Room 310">Room 310</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Issue Description *"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    sx={{ mb: 3 }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => {
                        setRoom('');
                        setDescription('');
                      }}
                    >
                      Clear
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained"
                      disabled={!room || !description}
                    >
                      Submit Request
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default MaintenancePage;