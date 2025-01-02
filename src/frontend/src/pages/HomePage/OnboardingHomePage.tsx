import React, { useEffect } from 'react';
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
import {
  useCheckedChecklists,
  useUsersChecklists,
  useAllChecklists,
  useChecklistProgress
} from '../../hooks/onboarding.hook';
import { Checklist } from 'shared';

const OnboardingHomePage = () => {
  const { data: organization, isError, error, isLoading } = useCurrentOrganization();
  const { setCurrentHomePage } = useHomePageContext();
  const theme = useTheme();

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
    </PageLayout>
  );
};

export default OnboardingHomePage;
