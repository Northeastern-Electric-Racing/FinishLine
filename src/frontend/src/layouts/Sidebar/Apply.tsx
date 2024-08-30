import { Button, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/system';
import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';

const Apply = () => {
  const theme = useTheme();
  const handleClick = () => {
    // this will need to be updated to use the hook when it is available
    window.open('https://google.com', '_blank');
  };

  return (
    <IconButton
      aria-label="Apply to NER"
      onClick={handleClick}
      color={theme.palette.text.primary}
      sx={{ padding: 0.5, marginLeft: 1.2, '&:hover': { backgroundColor: 'transparent' } }}
      style={{ borderRadius: 0, width: '100%', justifyContent: 'flex-start' }}
    >
      <SettingsIcon sx={{ fontSize: 27 }} style={{ color: theme.palette.text.primary }} />
      <Typography
        variant="body1"
        marginBottom={0.2}
        marginLeft={1}
        sx={{
          color: theme.palette.text.primary
        }}
      >
        Apply
      </Typography>
    </IconButton>
  );
};

export default Apply;
