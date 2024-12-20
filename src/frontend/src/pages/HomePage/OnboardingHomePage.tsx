import { Box, Grid, Typography, Button } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import { useEffect, useState } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHomePageContext } from '../../app/HomePageContext';
import ChecklistSection from './components/ChecklistSection';
import OnboardingInfoSection from './components/OnboardingInfoSection';
import ConfirmOnboardingChecklistModal from './components/ConfirmOnboardingChecklistModal'; // Import the modal
import { NERButton } from '../../components/NERButton';

const OnboardingHomePage = () => {
  const { data: organization, isError, error, isLoading } = useCurrentOrganization();
  const { setCurrentHomePage } = useHomePageContext();
  const [isModalOpen, setModalOpen] = useState(false); // State to manage modal visibility

  useEffect(() => {
    setCurrentHomePage('onboarding');
  }, [setCurrentHomePage]);

  if (!organization || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <PageLayout title="Home" hidePageTitle>
      <Grid container display={'flex'} alignItems={'center'} marginLeft={2} marginTop={4}>
        <Grid item xs={12} md={7}>
          <Typography sx={{ fontSize: '2.5em' }}>Welcome to the {organization.name} Team</Typography>
        </Grid>
        <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {/* Replace with the 'Finished' button */}
          <NERButton variant="contained" onClick={handleOpenModal}>
            Finished
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
          {/* Replace with the 'Progress Bar' component */}
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
      {/* Render modal conditionally */}
      {isModalOpen && <ConfirmOnboardingChecklistModal onClose={handleCloseModal} onFormSubmit={function (data: any): void {
        throw new Error('Function not implemented.');
      } } dataType={''} />}
    </PageLayout>
  );
};

export default OnboardingHomePage;
