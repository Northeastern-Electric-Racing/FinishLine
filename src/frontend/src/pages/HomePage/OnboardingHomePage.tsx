import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Button } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHomePageContext } from '../../app/HomePageContext';
import ChecklistSection from './components/ChecklistSection';
import OnboardingInfoSection from './components/OnboardingInfoSection';
import OnboardingProgressBar from '../../components/OnboardingProgressBar';
import { NERButton } from '../../components/NERButton';

const OnboardingHomePage = () => {
  const { data: organization, isError, error, isLoading } = useCurrentOrganization();
  const { setCurrentHomePage } = useHomePageContext();

  useEffect(() => {
    setCurrentHomePage('onboarding');
  }, [setCurrentHomePage]);

  if (!organization || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <PageLayout title="Home" hidePageTitle>
      <Grid container display="flex" alignItems="center" marginLeft={2} marginTop={4}>
        <Grid item xs={12} md={7}>
          <Typography sx={{ fontSize: '2.5em' }}>Welcome to the {organization.name} Team</Typography>
        </Grid>
        <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <NERButton variant="contained">Finished?</NERButton>
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
          <Box sx={{ width: '80%', mt: 4, ml: 2, display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '1.5em', flexShrink: 0, marginRight: 2 }}>Overall Progress</Typography>
            <Box sx={{ flexGrow: 1 }}>
              <OnboardingProgressBar value={50} />
            </Box>
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
