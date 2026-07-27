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
import OnboardingInfoSection from './components/OnboardingInfoSection';
import NewMemberFAQsSection from './components/NewMemberFAQsSection';
import NewMemberChecklistSummaryWidget from './components/NewMemberChecklistSummaryWidget';

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
          <OnboardingInfoSection />
        </Grid>
        <Grid item xs={12} md={4} sx={{ padding: 2 }}>
          <Typography sx={{ fontSize: '1.5em', mb: 1 }}>FAQs</Typography>
          <NewMemberFAQsSection />
        </Grid>
      </Grid>
      <Grid container display={'flex'}>
        <Grid item xs={12} sx={{ padding: 2 }}>
          <NewMemberChecklistSummaryWidget />
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default NewMemberHomePage;
