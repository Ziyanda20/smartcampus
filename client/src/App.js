import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { Navigate } from 'react-router-dom';
import theme from './theme';
import HomePage from './components/HomePage'; // Home page
import Login from './components/Login';
import RegisterStudent from './components/RegisterStudent';
import Dashboard from './components/Dashboard';
import BookingPage from './components/Booking/BookingPage';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';
import AdminDashboard from './components/admin/AdminDashboard';
import StudentMaintenancePage from './components/Maintenance/StudentMaintenancePage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterStudent />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Student routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/maintenance" element={<StudentMaintenancePage />} />
             
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

// Make sure this default export exists
export default App;