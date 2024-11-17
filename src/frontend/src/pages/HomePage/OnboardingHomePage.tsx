import { Grid, Typography } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import { useEffect } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHomePageContext } from '../../app/HomePageContext';
import QuestionsBlock from './components/QuestionsBlock';

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

  const gridStyle: React.CSSProperties = {
    justifyContent: 'flex-start',
    alignItems: 'flex-end'
  };

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography sx={{ fontSize: '3em', mt: 2, ml: 2 }}>Welcome to the Northeastern Electric Racing Team</Typography>
      <Grid container direction="column" sx={gridStyle}>
        {/* Placeholder */}
        <Grid item>
          <QuestionsBlock />
        </Grid>
        {/* Placeholder */}
        <Grid item>
          <QuestionsBlock />
        </Grid>
        <Grid item>
          <QuestionsBlock />
        </Grid>
      </Grid>
    </PageLayout>
  );
};
export default OnboardingHomePage;
