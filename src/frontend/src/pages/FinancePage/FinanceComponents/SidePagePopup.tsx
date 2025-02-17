import React from 'react';
import { Drawer, Box, Typography } from '@mui/material';

interface SidePageProps {
  showPage: boolean;
  handleClose: () => void;
  title: string;
  component: React.ReactNode;
}

const SidePage: React.FC<SidePageProps> = ({ showPage, handleClose, title, component }) => {
  return (
    <Drawer
      anchor="left"
      open={showPage}
      onClose={handleClose}
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: 'black', // Change drawer background color
          color: 'white', // Change text color
          width: '50vw'
        }
      }}
    >
      <Box
        sx={{
          width: '50vw',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: 'black', // Ensure content background is black
          color: 'white' // Ensure text remains white
        }}
      >
        {/* Side Page Content */}
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {/* Render Passed Component */}
        <Box sx={{ flexGrow: 1, width: '100%', overflow: 'auto' }}>{component}</Box>
      </Box>
    </Drawer>
  );
};

export default SidePage;
