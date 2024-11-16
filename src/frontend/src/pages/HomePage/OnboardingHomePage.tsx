import { Grid, Typography } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import { useEffect } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHomePageContext } from '../../app/HomePageContext';
import { Box } from '@mui/system';
import OnboardingBlock from './OnboardingBlock';

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
      <Grid item xs={12} md={4}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start'
          }}
        >
          <OnboardingBlock
            title="Onboarding"
            text="Thank you for applying to Northeastern Electric Racing! After reviewing your application, we are very excited to officially welcome you to our team."
          />
        </Box>
      </Grid>
    </PageLayout>
  );
};
export default OnboardingHomePage;
