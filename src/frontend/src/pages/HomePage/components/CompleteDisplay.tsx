import { Stack, Typography } from '@mui/material';
import React from 'react';

interface CompleteDisplayProps {
  icon: React.ReactNode;
  heading: String;
  message: String;
}

const CompleteDisplay: React.FC<CompleteDisplayProps> = ({ icon, heading, message }) => {
  return (
    <Stack direction="column" spacing={1} alignItems="center" justifyContent="center">
      {icon}
      <Typography variant="h4">{heading}</Typography>
      <Typography variant="subtitle1">{message}</Typography>
    </Stack>
  );
};

export default CompleteDisplay;
