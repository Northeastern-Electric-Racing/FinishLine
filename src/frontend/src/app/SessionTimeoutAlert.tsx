import React from 'react';
import { Box, Alert, AlertTitle } from '@mui/material';

const SessionTimeoutAlert: React.FC = () => {
  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <Alert
        variant="filled"
        severity="error"
        sx={{
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <AlertTitle>Your Session Has Expired!</AlertTitle>
        Please refresh the page to log back into FinishLine.
      </Alert>
    </Box>
  );
};

export default SessionTimeoutAlert;
