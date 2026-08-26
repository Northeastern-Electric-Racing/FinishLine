/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Box, Grid, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHomePageContext } from '../../app/HomePageContext';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import { routes } from '../../utils/routes';
import { NERButton } from '../../components/NERButton';
import NewMemberOnboardingInfoSection from './components/NewMemberOnboardingInfoSection';
import NewMemberMilestonesAndFAQsSection from './components/NewMemberMilestonesAndFAQsSection';
import NewMemberUsefulLinksWidget from './components/NewMemberUsefulLinksWidget';

const NewMemberHomePage = () => {
  const history = useHistory();
  const { setCurrentHomePage } = useHomePageContext();
  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();

  useEffect(() => {
    setCurrentHomePage('new-member');
  }, [setCurrentHomePage]);

  if (organizationIsError) {
    return <ErrorPage message={organizationError?.message} />;
  }

  if (!organization || organizationIsLoading) {
    return <LoadingIndicator />;
  }

  return (
    <PageLayout title="Home" hidePageTitle>
      <Grid container display={'flex'} alignItems={'center'} marginLeft={2} marginTop={4}>
        <Grid item xs={12} md={9}>
          <Typography variant="h4">Welcome to {organization.name} New Member Dashboard</Typography>
          <Typography sx={{ fontSize: '1.1em', mt: 1 }} color="text.secondary">
            You're ready to become a member! Check out the resources below to get started.
          </Typography>
        </Grid>
        <Grid item xs={12} md={3} display="flex" justifyContent="flex-end" paddingRight={3}>
          <Box component="img" src="/NER-Logo-App-Icon.png" alt="NER Logo" sx={{ height: '5rem', width: 'auto' }} />
        </Grid>
      </Grid>
      <Grid container display={'flex'}>
        <Grid item xs={12} md={8} sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <NewMemberOnboardingInfoSection />
          <Grid item sx={{ width: '100%' }}>
            <NewMemberUsefulLinksWidget dashboardFlag="isOnNewMemberDashboard" />
          </Grid>
          <Grid item sx={{ width: '100%' }}>
            <NERButton variant="contained" fullWidth onClick={() => history.push(routes.HOME_ONBOARDING)}>
              Click Me to View Your Completed Onboarding Checklist
            </NERButton>
          </Grid>
        </Grid>
        <Grid item xs={12} md={4} sx={{ padding: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mt: 0, mb: 0 }}>
              <NewMemberMilestonesAndFAQsSection />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default NewMemberHomePage;
