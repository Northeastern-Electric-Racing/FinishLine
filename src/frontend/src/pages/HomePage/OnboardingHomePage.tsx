import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHomePageContext } from '../../app/HomePageContext';
import ChecklistSection from './components/ChecklistSection';
import OnboardingInfoSection from './components/OnboardingInfoSection';
import OnboardingProgressBar from '../../components/OnboardingProgressBar';
import { NERButton } from '../../components/NERButton';
import { useGeneralChecklists, useUsersTeamTypeChecklists } from '../../hooks/onboarding.hook';
import { groupChecklists } from '../../utils/onboarding.utils';
import { useCurrentUser } from '../../hooks/users.hooks';

const OnboardingHomePage = () => {
  const user = useCurrentUser();
  const { data: organization, isError, error, isLoading } = useCurrentOrganization();
  const { setCurrentHomePage } = useHomePageContext();
  const theme = useTheme();

  const {
    data: generalChecklists,
    isError: generalChecklistsIsError,
    error: generalChecklistsError,
    isLoading: generalChecklistsIsLoading
  } = useGeneralChecklists();

  const {
    data: usersTeamTypeChecklists,
    isError: usersTeamTypeChecklistsIsError,
    error: usersTeamTypeChecklistsError,
    isLoading: usersTeamTypeChecklistsIsLoading
  } = useUsersTeamTypeChecklists();

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setCurrentHomePage('onboarding');
  }, [setCurrentHomePage]);

  useEffect(() => {
    if (!generalChecklists || !usersTeamTypeChecklists) return;

    const allChecklists = [...generalChecklists, ...usersTeamTypeChecklists];
    const groupedChecklists = groupChecklists(allChecklists);

    const groupNames = Object.keys(groupedChecklists);
    const totalGroups = groupNames.length;

    if (totalGroups === 0) {
      setProgress(0);
      return;
    }

    const completedGroups = groupNames.filter((group) =>
      groupedChecklists[group].every((checklist) =>
        checklist.usersChecked.some((checkedUser) => checkedUser.userId === user.userId)
      )
    ).length;

    setProgress((completedGroups / totalGroups) * 100);
  }, [generalChecklists, usersTeamTypeChecklists, user]);

  if (!organization || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  if (generalChecklistsIsError) {
    return <ErrorPage error={generalChecklistsError} />;
  }

  if (usersTeamTypeChecklistsIsError) {
    return <ErrorPage error={usersTeamTypeChecklistsError} />;
  }

  if (generalChecklistsIsLoading || usersTeamTypeChecklistsIsLoading) {
    return <LoadingIndicator />;
  }

  return (
    <PageLayout title="Home" hidePageTitle>
      <Grid container display="flex" alignItems="center" justifyContent={'space-between'} padding={1} marginTop={4}>
        <Grid item xs={12} md={7}>
          <Typography sx={{ fontSize: '2.5em' }}>Welcome to the {organization.name} Team</Typography>
        </Grid>
        <NERButton variant="contained" disabled={progress < 100}>
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
        <Grid container display="flex">
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
    </PageLayout>
  );
};

export default OnboardingHomePage;
