import { Typography, Box, Grid } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import { useEffect, useState } from 'react';
import FAQsSection from './components/FAQsSection';
import TimelineSection from './components/TimelineSection';
import Tabs from '../../components/Tabs';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHomePageContext } from '../../app/HomePageContext';

const OnboardingHomePage = () => {
  const { data: organization, isError, error, isLoading } = useCurrentOrganization();
  const { setOnPNMHomePage, setOnGuestHomePage, setOnOnboardingHomePage } = useHomePageContext();

  useEffect(() => {
    setOnPNMHomePage(false);
    setOnGuestHomePage(false);
    setOnOnboardingHomePage(true);
  }, [setOnPNMHomePage, setOnGuestHomePage, setOnOnboardingHomePage]);

  if (!organization || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography sx={{ fontSize: '3em', mt: 2, ml: 2 }}>Welcome to the Northeastern Electric Racing Team</Typography>
    </PageLayout>
  );
};
export default OnboardingHomePage;
