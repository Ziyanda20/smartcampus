import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert,
  FormControl, InputLabel, Select, MenuItem, IconButton
} from '@mui/material';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import api from '../../api';

function LecturerManagement() {
  const [lecturers, setLecturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentLecturer, setCurrentLecturer] = useState(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department_id: '',
    employee_id: ''
  });

  // In LecturerManagement.js
const fetchData = async () => {
  try {
    setLoading(true);
    const [lecturersRes, departmentsRes] = await Promise.all([
      api.get('/admin/lecturers'),
      api.get('/admin/departments')
    ]);
    
    setLecturers(lecturersRes.data.data || lecturersRes.data);
    setDepartments(departmentsRes.data.data || departmentsRes.data);
  } catch (error) {
    console.error('Fetch error:', error);
    showSnackbar(error.response?.data?.error || 'Failed to load data', 'error');
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Validate all fields are filled
      if (!formData.first_name || !formData.last_name || !formData.email || 
          !formData.department_id || !formData.employee_id) {
        showSnackbar('All fields are required', 'error');
        return;
      }

      setLoading(true);
      const url = currentLecturer 
        ? `/admin/lecturers/${currentLecturer.id}`
        : '/admin/lecturers';
      
      const method = currentLecturer ? 'put' : 'post';
      
      // Convert department_id to number
      const payload = {
        ...formData,
        department_id: Number(formData.department_id)
      };

      const response = await api[method](url, payload);

      if (response.data.success) {
        showSnackbar(
          currentLecturer ? 'Lecturer updated successfully' : 'Lecturer added successfully',
          'success'
        );
        await fetchData();
        handleClose();
      } else {
        showSnackbar(response.data.error || 'Operation failed', 'error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         (currentLecturer ? 'Failed to update lecturer' : 'Failed to add lecturer');
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await api.delete(`/admin/lecturers/${id}`);
      
      if (response.data.success) {
        showSnackbar('Lecturer deleted successfully', 'success');
        await fetchData();
      } else {
        showSnackbar(response.data.error || 'Failed to delete lecturer', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showSnackbar(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Failed to delete lecturer', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lecturer) => {
    setCurrentLecturer(lecturer);
    setFormData({
      first_name: lecturer.first_name,
      last_name: lecturer.last_name,
      email: lecturer.email,
      department_id: lecturer.department_id.toString(), // Ensure it's a string for the select
      employee_id: lecturer.employee_id
    });
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setCurrentLecturer(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      department_id: '',
      employee_id: ''
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Lecturer Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          disabled={loading}
        >
          Add Lecturer
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lecturers.length > 0 ? (
              lecturers.map((lecturer) => (
                <TableRow key={lecturer.id}>
                  <TableCell>{lecturer.employee_id}</TableCell>
                  <TableCell>{lecturer.first_name} {lecturer.last_name}</TableCell>
                  <TableCell>{lecturer.email}</TableCell>
                  <TableCell>{lecturer.department_name}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEdit(lecturer)}
                      disabled={loading}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(lecturer.id)}
                      disabled={loading}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {loading ? 'Loading...' : 'No lecturers found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>
          {currentLecturer ? 'Edit Lecturer' : 'Add New Lecturer'}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            disabled={loading}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, minWidth: 400 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="First Name *"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="Last Name *"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="Email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="Employee ID *"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={loading}
            />
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Department *</InputLabel>
              <Select
                name="department_id"
                value={formData.department_id}
                label="Department *"
                onChange={handleInputChange}
                required
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Processing...' : currentLecturer ? 'Update' : 'Add'} Lecturer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
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

export default LecturerManagement;