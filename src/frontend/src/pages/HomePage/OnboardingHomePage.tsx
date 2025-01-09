import { Box, Grid, Typography } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import React, { useEffect, useState } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useHomePageContext } from '../../app/HomePageContext';
import ChecklistSection from './components/ChecklistSection';
import OnboardingInfoSection from './components/OnboardingInfoSection';
import ConfirmOnboardingChecklistModal from './components/ConfirmOnboardingChecklistModal';
import { NERButton } from '../../components/NERButton';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';

const OnboardingHomePage = () => {
  const history = useHistory();
  const [isModalOpen, setModalOpen] = useState(false);
  const { setCurrentHomePage } = useHomePageContext();
  const { data: organization, isLoading: organizationIsLoading } = useCurrentOrganization();

  useEffect(() => {
    setCurrentHomePage('onboarding');
  }, [setCurrentHomePage]);

  if (organizationIsLoading || !organization) {
    return <LoadingIndicator />;
  }

  const handleConfirmModal = async () => {
    history.push(routes.HOME_ACCEPT);
  };

  return (
    <PageLayout title="Home" hidePageTitle>
      <Grid container display={'flex'} alignItems={'center'} marginLeft={2} marginTop={4}>
        <Grid item xs={12} md={7}>
          <Typography sx={{ fontSize: '2.5em' }}>Welcome to the {organization.name} Team</Typography>
        </Grid>
        <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <NERButton variant="contained" onClick={() => setModalOpen(true)}>
            Finished?
          </NERButton>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={3}
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box display={'flex'} justifyContent={'center'}>
          <Typography sx={{ fontSize: '2em', mt: 4, ml: 2 }}>Progress Bar</Typography>
        </Box>
        <Grid container display={'flex'}>
          <Grid
            item
            xs={12}
            md={7}
            sx={{
              maxHeight: '82vh',
              overflow: 'auto',
              scrollbarColor: 'transparent transparent',
              scrollbarWidth: 'none',
              padding: 2
            }}
          >
            <ChecklistSection />
          </Grid>
          <Grid container item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 4 }}>
            <Grid item>
              <OnboardingInfoSection />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {isModalOpen && (
        <ConfirmOnboardingChecklistModal
          open={isModalOpen}
          onHide={() => setModalOpen(false)}
          onConfirm={handleConfirmModal}
          title="Confirm Onboarding Checklist"
        />
      )}
    </PageLayout>
  );
};

export default OnboardingHomePage;
