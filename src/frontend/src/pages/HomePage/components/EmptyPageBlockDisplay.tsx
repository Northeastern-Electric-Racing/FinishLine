import { Stack, Typography } from '@mui/material';
import React from 'react';

interface EmptyPageBlockDisplayProps {
  icon: React.ReactNode;
  heading: String;
  message: String;
}

const EmptyPageBlockDisplay: React.FC<EmptyPageBlockDisplayProps> = ({ icon, heading, message }) => {
  return (
    <Stack direction="column" spacing={1} alignItems="center" justifyContent="center">
      {icon}
      <Typography variant="h4">{heading}</Typography>
      <Typography variant="subtitle1">{message}</Typography>
    </Stack>
  );
};

export default EmptyPageBlockDisplay;
