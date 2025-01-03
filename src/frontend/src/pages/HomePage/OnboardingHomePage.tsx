import { Box, Grid, Typography } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import React, { useEffect, useState } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHomePageContext } from '../../app/HomePageContext';
import ChecklistSection from './components/ChecklistSection';
import OnboardingInfoSection from './components/OnboardingInfoSection';
import ConfirmOnboardingChecklistModal from './components/ConfirmOnboardingChecklistModal';
import { NERButton } from '../../components/NERButton';
import {
  useCheckedChecklists,
  useUsersChecklists,
  useAllChecklists,
  useChecklistProgress
} from '../../hooks/onboarding.hook';
import { Checklist } from 'shared';
import { useToggleCompletedOnboarding } from '../../hooks/users.hooks';
import { useToast } from '../../hooks/toasts.hooks';

const OnboardingHomePage = () => {
  const { data: organization, isError, error, isLoading } = useCurrentOrganization();
  const { setCurrentHomePage } = useHomePageContext();
  const [isModalOpen, setModalOpen] = useState(false);

  const toast = useToast();

  const toggleCompletedOnboarding = useToggleCompletedOnboarding();

  useEffect(() => {
    setCurrentHomePage('onboarding');
  }, [setCurrentHomePage]);

  const {
    data: allChecklists,
    isError: allChecklistsIsError,
    error: allChecklistsError,
    isLoading: allChecklistsIsLoading
  } = useAllChecklists();

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

  const generalChecklists =
    allChecklists?.filter((checklist: Checklist) => checklist.team === null && checklist.teamType === null) || [];

  const progress = useChecklistProgress([...generalChecklists, ...(usersChecklists || [])], checkedChecklists || []);

  if (isError) return <ErrorPage message={error?.message} />;

  if (usersChecklistsIsError) {
    return <ErrorPage error={usersChecklistsError} />;
  }

  if (checkedChecklistsIsError) {
    return <ErrorPage error={checkedChecklistsError} />;
  }

  if (allChecklistsIsError) {
    return <ErrorPage error={allChecklistsError} />;
  }

  if (
    !organization ||
    isLoading ||
    usersChecklistsIsLoading ||
    !usersChecklists ||
    checkedChecklistsLoading ||
    !checkedChecklists ||
    allChecklistsIsLoading ||
    !allChecklists
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
    await toggleCompletedOnboarding.mutateAsync();
    toast.success('Role updated successfully!');
    setModalOpen(false);
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
            <ChecklistSection
              usersChecklists={usersChecklists}
              checkedChecklists={checkedChecklists}
              generalChecklists={generalChecklists}
            />
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
