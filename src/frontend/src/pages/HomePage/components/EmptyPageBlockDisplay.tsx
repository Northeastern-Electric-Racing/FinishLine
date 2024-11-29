import { Box, Typography } from '@mui/material';
import React from 'react';

interface EmptyPageBlockDisplayProps {
  icon: React.ReactNode;
  heading: String;
  message: String;
}

const EmptyPageBlockDisplay: React.FC<EmptyPageBlockDisplayProps> = ({ icon, heading, message }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}
    >
      {icon}
      <Typography variant="h4">{heading}</Typography>
      <Typography variant="subtitle1">{message}</Typography>
    </Box>
  );
};

export default EmptyPageBlockDisplay;
