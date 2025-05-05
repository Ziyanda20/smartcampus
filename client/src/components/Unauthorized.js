import { Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        403 - Unauthorized Access
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        You don't have permission to access this page.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/dashboard')}
      >
        Return to Dashboard
      </Button>
    </Box>
  );
}

export default Unauthorized;