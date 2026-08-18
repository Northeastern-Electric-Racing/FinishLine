import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import UsefulLinksTable from './UsefulLinks/UsefulLinksTable';
import LinkTypeTable from '../ProjectsConfig/LinkTypes/LinkTypeTable';

const NewMemberDashboardUsefulLinksSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        height: '100%',
        borderRadius: '10px',
        padding: '16px',
        width: '100%'
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: 'white',
          fontWeight: 'bold',
          marginBottom: '12px'
        }}
      >
        New Member Dashboard Useful Links
      </Typography>
      <LinkTypeTable isOnNewMemberDashboard />
      <UsefulLinksTable isOnNewMemberDashboard />
    </Box>
  );
};

export default NewMemberDashboardUsefulLinksSection;
