import React from 'react';
import { Drawer, IconButton, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface SidePageProps {
  showPage: boolean;
  handleClose: () => void;
  Title: string;
}

const SidePage: React.FC<SidePageProps> = ({ showPage, handleClose, Title }) => {
  return (
    <Drawer anchor="left" open={showPage} onClose={handleClose}>
      <Box
        sx={{
          width: '50vw',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}
      >
        {/* Close Button */}
        <IconButton onClick={handleClose} sx={{ alignSelf: 'flex-end' }}>
          <CloseIcon />
        </IconButton>

        {/* Side Page Content */}
        <Typography variant="h6" gutterBottom>
          {Title}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default SidePage;
