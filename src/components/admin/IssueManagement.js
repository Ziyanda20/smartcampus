import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Snackbar
} from '@mui/material';
import {
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Construction as ConstructionIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';

// Status configuration
const statusConfig = {
  pending: { icon: <PendingIcon color="warning" />, color: 'warning' },
  in_progress: { icon: <ConstructionIcon color="info" />, color: 'info' },
  completed: { icon: <CheckCircleIcon color="success" />, color: 'success' },
  cancelled: { icon: <CancelIcon color="error" />, color: 'error' }
};

function AdminMaintenance() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  
  const [filters, setFilters] = useState({
    status: '',
    building: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    feedback: ''
  });

  // Get auth token from storage
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Show snackbar message
  const showSnackbar = (message, severity = 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Fetch maintenance requests
  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const response = await axios.get('http://localhost:5000/admin/maintenance', {
        params: filters,
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      if (response.data.success) {
        setRequests(response.data.data || []);
      } else {
        throw new Error(response.data.error || 'Failed to load maintenance requests');
      }
    } catch (err) {
      console.error('Failed to fetch maintenance requests:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load maintenance requests');
      showSnackbar(err.response?.data?.error || err.message || 'Failed to load maintenance requests', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMaintenanceStats = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get('/api/maintenance/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(response.data.data || null);
    } catch (err) {
      console.error('Failed to fetch maintenance stats:', err);
      showSnackbar('Failed to load maintenance statistics');
    }
  };
  // Fetch maintenance stats
  // const fetchMaintenanceStats = async () => {
  //   try {
  //     const token = getAuthToken();
  //     const response = await axios.get('/maintenance/stats', {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });
  //     setStats(response.data.data || null);
  //   } catch (err) {
  //     console.error('Failed to fetch maintenance stats:', err);
  //     showSnackbar('Failed to load maintenance statistics');
  //   }
  // };

  // Handle status update
  const handleStatusUpdate = async () => {
    try {
      const token = getAuthToken();
      await axios.put(
        `/maintenance/${selectedRequest.id}/status`,
        updateData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      showSnackbar('Maintenance request updated successfully', 'success');
      fetchMaintenanceRequests();
      setDialogOpen(false);
    } catch (err) {
      console.error('Update Error:', err);
      showSnackbar(err.response?.data?.error || 'Failed to update maintenance request');
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchMaintenanceRequests(),
        fetchMaintenanceStats()
      ]);
    };
    
    loadData();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchMaintenanceRequests();
  }, [filters]);

  // Handle dialog open
  const handleOpenDialog = (request) => {
    setSelectedRequest(request);
    setUpdateData({
      status: request.status,
      feedback: request.admin_feedback || ''
    });
    setDialogOpen(true);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        <BuildIcon sx={{ verticalAlign: 'middle', mr: 2 }} />
        Maintenance Management
      </Typography>

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading ? (
          <Grid item xs={12}>
            <CircularProgress />
          </Grid>
        ) : stats?.statusStats?.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.status}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: `${statusConfig[stat.status]?.color || 'primary'}.light`, 
                    color: `${statusConfig[stat.status]?.color || 'primary'}.dark`,
                    mr: 2
                  }}>
                    {statusConfig[stat.status]?.icon || <BuildIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stat.count}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.status.replace('_', ' ')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="From Date"
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="To Date"
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Requests Table */}
      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Room</TableCell>
                <TableCell>Issue</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reported On</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No maintenance requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Typography fontWeight="bold">Room {request.room_id}</Typography>
                    </TableCell>
                    <TableCell>{request.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={request.status.replace('_', ' ')}
                        color={statusConfig[request.status]?.color || 'default'}
                        icon={statusConfig[request.status]?.icon || <BuildIcon />}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AssignmentIcon />}
                        onClick={() => handleOpenDialog(request)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Update Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <BuildIcon sx={{ mr: 1 }} />
            Manage Maintenance Request
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Room:</strong> {selectedRequest.room_id}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Issue:</strong> {selectedRequest.description}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Reported On:</strong> {format(new Date(selectedRequest.created_at), 'PPpp')}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Admin Feedback"
                value={updateData.feedback}
                onChange={(e) => setUpdateData({ ...updateData, feedback: e.target.value })}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleStatusUpdate}
            disabled={!updateData.status}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminMaintenance;