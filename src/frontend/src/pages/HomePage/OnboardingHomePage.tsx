import { Box, Grid, Typography } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import { useEffect, useState } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHomePageContext } from '../../app/HomePageContext';
import ChecklistSection from './components/ChecklistSection';
import OnboardingInfoSection from './components/OnboardingInfoSection';
import { NERButton } from '../../components/NERButton';
import ProgressBarWithValue from '../../components/ProgressBarWithValue';

const OnboardingHomePage = () => {
  const { data: organization, isError, error, isLoading } = useCurrentOrganization();
  const { setOnPNMHomePage, setOnGuestHomePage, setOnOnboardingHomePage } = useHomePageContext();
  const [progress, setProgress] = useState(0);

  const calculateProgress = () => {
    // logic to calcualte progress using checklists
    return 25; // static value for now
  };

  useEffect(() => {
    setOnPNMHomePage(false);
    setOnGuestHomePage(false);
    setOnOnboardingHomePage(true);
  }, [setOnPNMHomePage, setOnGuestHomePage, setOnOnboardingHomePage]);

  useEffect(() => {
    const calculatedProgress = calculateProgress();
    setProgress(calculatedProgress);
  }, []);

  if (!organization || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <PageLayout title="Home" hidePageTitle>
      <Grid container display={'flex'} alignItems={'center'} marginLeft={2} marginTop={4}>
        <Grid item xs={12} md={7}>
          <Typography sx={{ fontSize: '2.5em' }}>Welcome to the Northeastern Electric Racing Team</Typography>
        </Grid>
        <NERButton
          variant="contained"
          style={{
            backgroundColor: progress === 100 ? '#ef4345' : '#5b5b5b',
            color: 'white'
          }}
          disabled={progress !== 100}
        >
          Finished?
        </NERButton>
        <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Typography sx={{ fontSize: '2em' }}>Finished</Typography>
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
        <Box display={'flex'} justifyContent={'center'}>
          <ProgressBarWithValue value={progress} />
          <Typography sx={{ fontSize: '2em', mt: 4, ml: 2 }}>Progress Bar</Typography>
        </Box>
        <Grid container display={'flex'}>
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
