/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Grid, Typography } from '@mui/material';
import { useEffect } from 'react';
import PageLayout from '../../components/PageLayout';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHomePageContext } from '../../app/HomePageContext';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import NewMemberOnboardingInfoSection from './components/NewMemberOnboardingInfoSection';
import NewMemberFAQsSection from './components/NewMemberFAQsSection';
import NewMemberChecklistSummaryWidget from './components/NewMemberChecklistSummaryWidget';
import NewMemberUsefulLinksWidget from './components/NewMemberUsefulLinksWidget';
import NewMemberContactsWidget from './components/NewMemberContactsWidget';

const NewMemberHomePage = () => {
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
        <Grid item xs={12}>
          <Typography sx={{ fontSize: '2.5em' }}>Welcome to the {organization.name} Team</Typography>
          <Typography sx={{ fontSize: '1.1em', mt: 1 }} color="text.secondary">
            Here's what's coming up while you get settled in
          </Typography>
        </Grid>
      </Grid>
      <Grid container display={'flex'}>
        <Grid item xs={12} md={8} sx={{ padding: 2 }}>
          <NewMemberOnboardingInfoSection />
        </Grid>
        <Grid item xs={12} md={4} sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Grid item sx={{ width: '100%' }}>
            <Typography sx={{ fontSize: '1.5em', mb: 1 }}>FAQs</Typography>
            <NewMemberFAQsSection />
          </Grid>
          <Grid item sx={{ width: '100%' }}>
            <NewMemberChecklistSummaryWidget />
          </Grid>
          <Grid item sx={{ width: '100%' }}>
            <NewMemberUsefulLinksWidget dashboardFlag="isOnNewMemberDashboard" />
          </Grid>
          <Grid item sx={{ width: '100%' }}>
            <NewMemberContactsWidget />
          </Grid>
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default NewMemberHomePage;
