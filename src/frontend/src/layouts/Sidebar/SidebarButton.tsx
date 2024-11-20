import { IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/system';
import React from 'react';

interface SidebarButtonProps {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}

const SidebarButton = ({ onClick, label, icon }: SidebarButtonProps) => {
  const theme = useTheme();

  return (
    <IconButton
      onClick={onClick}
      color={theme.palette.text.primary}
      sx={{ padding: 0.5, marginLeft: 1.2, '&:hover': { backgroundColor: 'transparent' } }}
      style={{ borderRadius: 0, width: '100%', justifyContent: 'flex-start' }}
    >
      {icon}
      <Typography
        variant="body1"
        marginBottom={0.2}
        marginLeft={1}
        sx={{
          color: theme.palette.text.primary
        }}
      >
        {label}
      </Typography>
    </IconButton>
  );
};

export default SidebarButton;
