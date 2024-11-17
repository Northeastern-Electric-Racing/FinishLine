import { Grid, Typography } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import { useEffect } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHomePageContext } from '../../app/HomePageContext';
import { Box } from '@mui/system';

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
      <Grid
        container
        spacing={3}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}
      >
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              backgroundColor: '#272727',
              borderRadius: '8px',
              padding: 2,
              width: '400px'
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              Onboarding
            </Typography>
            <Typography variant="body1" sx={{ color: '#CCCCCC', lineHeight: 1.5, marginBottom: 5 }}>
              Thank you for applying to Northeastern Electric Racing! After reviewing your application, we are very excited
              to officially welcome you to our team.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              backgroundColor: '#272727',
              borderRadius: '8px',
              padding: 2,
              width: '400px'
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              Useful Links
            </Typography>
            <Typography variant="body1" sx={{ color: '#CCCCCC', lineHeight: 1.5 }}>
              Useful Links placeholder.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box
            sx={{
              backgroundColor: '#272727',
              borderRadius: '8px',
              padding: 2,
              width: '400px'
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              Questions
            </Typography>
            <Typography variant="body1" sx={{ color: '#CCCCCC', lineHeight: 1.5 }}>
              Questions placeholder.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </PageLayout>
  );
};
export default OnboardingHomePage;
