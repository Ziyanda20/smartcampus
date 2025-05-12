import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import MaintenanceForm from './MaintenanceForm';
import MaintenanceList from './MaintenanceList';

const StudentMaintenancePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshList, setRefreshList] = useState(false);
  const userId = 1; // Replace with actual user ID from your auth system

  const handleSuccess = () => {
    setRefreshList(prev => !prev);
    setActiveTab(0);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Maintenance Requests
      </Typography>
      
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
        <Tab label="My Requests" />
        <Tab label="Report New Issue" />
      </Tabs>
      
      {activeTab === 0 && (
        <MaintenanceList userId={userId} refresh={refreshList} />
      )}
      
      {activeTab === 1 && (
        <MaintenanceForm userId={userId} onSuccess={handleSuccess} />
      )}
    </Box>
  );
};

export default StudentMaintenancePage;