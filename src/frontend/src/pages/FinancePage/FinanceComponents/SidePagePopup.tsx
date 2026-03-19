import React from 'react';
import { Drawer, Box, Typography, useTheme } from '@mui/material';

interface SidePageProps {
  showPage: boolean;
  handleClose: () => void;
  title: string;
  component: React.ReactNode;
}

const SidePage: React.FC<SidePageProps> = ({ showPage, handleClose, title, component }) => {
  const theme = useTheme();

  return (
    <Drawer anchor="left" open={showPage} onClose={handleClose}>
      <Box
        sx={{
          width: '50vw',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: theme.palette.background.default,
          color: theme.palette.primary.light
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontSize: '32px', ml: 1, mb: 2, mt: 1 }}>
          {title}
        </Typography>
        <Box sx={{ ml: 1, pr: 2, flexGrow: 1, overflow: 'auto' }}>{component}</Box>
      </Box>
    </Drawer>
  );
};

export default SidePage;
