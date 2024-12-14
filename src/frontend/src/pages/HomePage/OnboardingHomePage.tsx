import { Box, Grid, Typography } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import { useEffect } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHomePageContext } from '../../app/HomePageContext';
import OnboardingInfoSection from './components/OnboardingInfoSection';

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
      <Grid display={'flex'} alignItems={'center'} marginLeft={2} marginTop={4}>
        <Typography sx={{ fontSize: '2.5em' }}>Welcome to the Northeastern Electric Racing Team</Typography>
        {/* This will be replaced with the 'Finished' button*/}
        <Typography sx={{ fontSize: '2em', mt: 4, ml: 65 }}>Finished</Typography>
      </Grid>
      <Grid
        container
        spacing={3}
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box display={'flex'} justifyContent={'center'}>
          {/* This will be replaced with the 'Progress Bar' component*/}
          <Typography sx={{ fontSize: '2em', mt: 4, ml: 2 }}>Progress Bar</Typography>
        </Box>
        <Grid container display={'flex'}>
          {/* This will be replaced with the 'Checklist' component*/}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                height: '150vh',
                width: '100%',
                mt: 4
              }}
            >
              <Box
                sx={{
                  backgroundColor: 'gray',
                  height: '50%',
                  width: '95%',
                  borderRadius: '10px'
                }}
              >
                <Typography>Checklists</Typography>
              </Box>
            </Box>
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
