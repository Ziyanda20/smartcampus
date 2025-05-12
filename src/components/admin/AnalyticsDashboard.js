import React, { useState, useEffect } from 'react';
import {
  Box, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  IconButton,
  Chip
} from '@mui/material';
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C', '#D0ED57'];

const AnalyticsDashboard = () => {
  const { enqueueSnackbar } = useSnackbar(); 

  const showSnackbar = (message, variant = 'default') => {
    enqueueSnackbar(message, { variant });
  };
  
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState({
    bookings: [],
    userActivity: [],
    roomUsage: [],
    availableRooms: [],
    systemStats: {},
    bookingStatus: [],
    loading: true
  });
  
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      const token = localStorage.getItem('token');
  
      const [analyticsRes, availableRoomsRes] = await Promise.all([
        axios.get(`http://localhost:5000/admin/analytics?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/admin/rooms/available', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
  
      // Transform bookings trend data for chart
      const bookingsTrend = analyticsRes.data.data.bookingsTrend?.map(item => ({
        date: format(new Date(item.date), 'yyyy-MM-dd'),
        bookings: item.count
      })) || [];
  
      setStats({
        systemStats: analyticsRes.data.data.systemStats || {},
        bookings: bookingsTrend,
        bookingStatus: analyticsRes.data.data.bookingStatus || [],
        roomUsage: analyticsRes.data.data.roomUsage || [],
        availableRooms: availableRoomsRes.data.data || [],
        loading: false
      });
  
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Analytics error:', error);
      setStats(prev => ({ ...prev, loading: false }));
      showSnackbar(
        error.response?.data?.error || 'Failed to load analytics data',
        'error'
      );
    }
  };
  
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const StatCard = ({ title, value, icon, change }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ mr: 2 }}>
            {icon}
          </Typography>
          <Typography variant="h4">
            {stats.loading ? <LinearProgress sx={{ width: 60 }} /> : value}
          </Typography>
        </Box>
        {change !== undefined && (
          <Typography 
            variant="caption" 
            color={change >= 0 ? 'success.main' : 'error.main'}
            sx={{ mt: 1, display: 'block' }}
          >
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last period
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderChart = (title, chartComponent, height = 400) => (
    <Card sx={{ height: '100%', minWidth: 350 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        {stats.loading ? (
          <Box sx={{ height: height - 50, display: 'flex', alignItems: 'center' }}>
            <LinearProgress sx={{ width: '100%' }} />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {chartComponent}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3, width: '100%', overflowX: 'auto' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h4">System Analytics</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="day">Last Day</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {lastUpdated && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
          Last updated: {format(lastUpdated, 'PPpp')}
        </Typography>
      )}

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Total Users" 
            value={stats.systemStats?.totalUsers || 0} 
            icon="👥"
            change={stats.systemStats?.userGrowth || 0}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Active Bookings" 
            value={stats.systemStats?.activeBookings || 0} 
            icon="📅"
            change={stats.systemStats?.bookingGrowth || 0}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Available Rooms" 
            value={stats.availableRooms.length || 0} 
            icon="🚪"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Pending Issues" 
            value={stats.systemStats?.pendingIssues || 0} 
            icon="⚠️"
          />
        </Grid>
      </Grid>

      {/* Main Charts - All in one row */}
      <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2 }}>
        {/* Bookings Trend */}
        {renderChart('Bookings Trend', 
          <AreaChart data={stats.bookings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="bookings" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.8}
            />
          </AreaChart>,
          400
        )}

        {/* Booking Status */}
        {renderChart('Booking Status', 
          <PieChart>
            <Pie
              data={stats.bookingStatus || []}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              nameKey="status"
              label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
            >
              {(stats.bookingStatus || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>,
          400
        )}

        {/* Room Usage */}
        {renderChart('Room Usage', 
          <BarChart data={stats.roomUsage}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="booking_count" fill="#8884d8" />
          </BarChart>,
          400
        )}
      </Box>

      {/* Available Rooms */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Available Rooms</Typography>
              {stats.loading ? (
                <LinearProgress />
              ) : (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <Grid container spacing={2}>
                    {stats.availableRooms.map(room => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={room.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1">{room.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Building: {room.building}
                            </Typography>
                            <Typography variant="body2">
                              Capacity: {room.capacity}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;