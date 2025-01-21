import React, { useState } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Organization } from 'shared';
import EditOnboardingTextModal from './EditOnboardingTextModal';

interface OnboardingBlockProps {
  organization: Organization;
  isAdmin?: boolean;
}

const OnboardingBlock: React.FC<OnboardingBlockProps> = ({ organization, isAdmin }) => {
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);

  const handleEdit = () => {
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <Grid>
      <Box
        sx={{
          height: '25vh',
          borderRadius: '10px',
          width: '100%',
          background: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5" ml={2} pt={2}>
            Onboarding
          </Typography>
          {isAdmin && (
            <EditIcon
              onClick={handleEdit}
              sx={{
                marginRight: '15px',
                marginTop: '20px',
                cursor: 'pointer'
              }}
            />
          )}
        </Box>
        <Typography sx={{ mt: 1, ml: 2, fontSize: { xs: 16, sm: 16, md: 18 }, marginRight: '15px' }}>
          {organization.onboardingText}
        </Typography>
      </Box>
      <EditOnboardingTextModal open={showModal} onHide={handleClose} currentOnboardingText={organization.onboardingText} />
    </Grid>
  );
};

export default OnboardingBlock;
