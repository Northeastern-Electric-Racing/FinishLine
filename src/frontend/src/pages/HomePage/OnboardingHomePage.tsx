import { Box, Grid, Typography, useTheme } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import React, { useEffect, useState } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useHomePageContext } from '../../app/HomePageContext';
import ChecklistSection from './components/ChecklistSection';
import OnboardingInfoSection from './components/OnboardingInfoSection';
import ConfirmOnboardingChecklistModal from './components/ConfirmOnboardingChecklistModal';
import { NERButton } from '../../components/NERButton';
import { useCheckedChecklists, useUsersChecklists, useChecklistProgress } from '../../hooks/onboarding.hook';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import OnboardingProgressBar from '../../components/OnboardingProgressBar';
import ErrorPage from '../ErrorPage';

const OnboardingHomePage = () => {
  const history = useHistory();
  const [isModalOpen, setModalOpen] = useState(false);
  const { setCurrentHomePage } = useHomePageContext();
  const { data: organization, isLoading: organizationIsLoading } = useCurrentOrganization();
  const theme = useTheme();

  useEffect(() => {
    setCurrentHomePage('onboarding');
  }, [setCurrentHomePage]);

  const {
    data: usersChecklists,
    isError: usersChecklistsIsError,
    error: usersChecklistsError,
    isLoading: usersChecklistsIsLoading
  } = useUsersChecklists();

  const {
    data: checkedChecklists,
    isLoading: checkedChecklistsLoading,
    isError: checkedChecklistsIsError,
    error: checkedChecklistsError
  } = useCheckedChecklists();

  const progress = useChecklistProgress(usersChecklists || [], checkedChecklists || []);

  if (usersChecklistsIsError) {
    return <ErrorPage error={usersChecklistsError} />;
  }

  if (checkedChecklistsIsError) {
    return <ErrorPage error={checkedChecklistsError} />;
  }

  if (
    !organization ||
    usersChecklistsIsLoading ||
    !usersChecklists ||
    checkedChecklistsLoading ||
    !checkedChecklists ||
    organizationIsLoading
  ) {
    return <LoadingIndicator />;
  }

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleConfirmModal = async () => {
    history.push(routes.HOME_ACCEPT);
  };

  return (
    <PageLayout title="Home" hidePageTitle>
      <Grid container display={'flex'} alignItems={'center'} marginLeft={2} marginTop={4}>
        <Grid item xs={12} md={7}>
          <Typography sx={{ fontSize: '2.5em' }}>Welcome to the {organization.name} Team</Typography>
        </Grid>
        <NERButton variant="contained" disabled={progress < 100} onClick={handleOpenModal}>
          Finished?
        </NERButton>
      </Grid>
      <Grid
        container
        spacing={3}
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box display="flex" justifyContent="center">
          <Box
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 5,
              p: 3.5,
              flexGrow: 1,
              width: '100%',
              mt: 5,
              ml: 4,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <OnboardingProgressBar
              value={Math.round(progress)}
              text={`Complete`}
              typographySx={{ fontSize: '1.2em' }}
              progressBarSx={{ height: '3vh' }}
            />
          </Box>
        </Box>
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
            <ChecklistSection usersChecklists={usersChecklists} checkedChecklists={checkedChecklists} />
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
          onHide={handleCloseModal}
          onConfirm={handleConfirmModal}
          title="Confirm Onboarding Checklist"
        />
      )}
    </PageLayout>
  );
};

export default OnboardingHomePage;
