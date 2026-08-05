import { Box, Grid, Typography, useTheme } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import React, { useEffect, useState } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useHomePageContext } from '../../app/HomePageContext';
import ChecklistSection from './components/ChecklistSection';
import NewMemberOnboardingInfoSection from './components/NewMemberOnboardingInfoSection';
import ConfirmOnboardingChecklistModal from './components/ConfirmOnboardingChecklistModal';
import SetSlackIdModal from './components/SetSlackIdModal';
import { NERButton } from '../../components/NERButton';
import { useCheckedChecklists, useUsersChecklists, useChecklistProgress } from '../../hooks/onboarding.hook';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import OnboardingProgressBar from '../../components/OnboardingProgressBar';
import ErrorPage from '../ErrorPage';
import { useCompleteOnboarding } from '../../hooks/team-types.hooks';
import { useAuth } from '../../hooks/auth.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import { SlackIdGateProvider, useSlackIdGate } from './SlackIdGateContext';

const OnboardingHomePage = () => (
  <SlackIdGateProvider>
    <OnboardingHomePageContent />
  </SlackIdGateProvider>
);

const OnboardingHomePageContent = () => {
  const history = useHistory();
  const auth = useAuth();
  const user = useCurrentUser();
  const { hasSlackId, isLoading: slackIdIsLoading } = useSlackIdGate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSlackIdModalOpen, setSlackIdModalOpen] = useState(false);
  const { setCurrentHomePage } = useHomePageContext();
  const { data: organization, isLoading: organizationIsLoading } = useCurrentOrganization();
  const theme = useTheme();

  // new members can revisit this page to look back at what they completed -- the "Finished?"
  // button must not be clickable again, since completeOnboarding() would re-derive
  // onboardedTeamTypeIds from onboardingTeamTypes (now empty) and wipe their completed status
  const alreadyCompletedOnboarding = user.onboardedTeamTypeIds.length > 0;

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

  const { mutateAsync: completeOnboarding } = useCompleteOnboarding();

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

  const handleFinishedClick = () => {
    if (!hasSlackId) {
      setSlackIdModalOpen(true);
      return;
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSlackIdSuccess = async () => {
    setSlackIdModalOpen(false);
    // they just had to set their Slack ID to get here, so there's nothing left to confirm --
    // skip the "are you sure?" modal and finish onboarding right away
    await handleConfirmModal();
  };

  const handleConfirmModal = async () => {
    await completeOnboarding();
    // the logged-in user object is plain client state, not refetched automatically,
    // so it needs to be refreshed here for Home.tsx's routing to see the completed onboarding status
    await auth.signInCurrent();
    history.push(routes.HOME);
  };

  return (
    <PageLayout title="Home" hidePageTitle>
      <Grid container display={'flex'} alignItems={'center'} marginLeft={2} marginTop={4}>
        <Grid item xs={12} md={9}>
          <Typography variant="h3">Welcome to {organization.name} Onboarding</Typography>
          {organization.onboardingText && (
            <Typography sx={{ fontSize: '1.1em', mt: 1 }} color="text.secondary">
              {organization.onboardingText}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} md={3} display={'flex'} justifyContent={'flex-end'} paddingRight={3}>
          {alreadyCompletedOnboarding ? (
            <NERButton variant="contained" onClick={() => history.push(routes.HOME_NEW_MEMBER)}>
              Back to New Member Dashboard
            </NERButton>
          ) : (
            <NERButton variant="contained" disabled={progress < 100 || slackIdIsLoading} onClick={handleFinishedClick}>
              Finished?
            </NERButton>
          )}
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
        <Grid container display={'flex'}>
          <Grid
            item
            xs={12}
            md={8}
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
          <Grid container item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 4 }}>
            <Grid item>
              <NewMemberOnboardingInfoSection variant="checklist" />
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
      {isSlackIdModalOpen && (
        <SetSlackIdModal
          open={isSlackIdModalOpen}
          onHide={() => setSlackIdModalOpen(false)}
          onSuccess={handleSlackIdSuccess}
        />
      )}
    </PageLayout>
  );
};

export default OnboardingHomePage;
