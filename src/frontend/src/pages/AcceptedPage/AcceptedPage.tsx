import { Typography, Box, Grid } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useSingleUserSettings } from '../../hooks/users.hooks';
import { NERButton } from '../../components/NERButton';

interface AcceptedPageProps {
  user: AuthenticatedUser;
}

const AcceptedPage = ({ user }: AcceptedPageProps) => {
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(user.userId);

  if (isLoading || !userSettingsData) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  return (
    <PageLayout title="Accepted" hidePageTitle>
      <Box sx={{ mt: 6, ml: 4 }}>
        <Typography variant="h2" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
          Congratulations, {user.firstName}!
        </Typography>
        <Typography
          variant="h3"
          marginLeft="auto"
          sx={{ marginTop: 2, textAlign: 'center', pt: 1, padding: 0, fontWeight: 1 }}
        >
          We are so excited to welcome you to Northeastern Electric Racing!
        </Typography>
      </Box>
      <Box
        component="img"
        src={'../NER-Logo-App-Icon.png'}
        sx={{
          width: '25%',
          height: '25%',
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: 2
        }}
      />
      <Box sx={{ mt: 2, ml: 2 }}>
        <Typography
          variant="h6"
          marginLeft="auto"
          sx={{ marginTop: 5, textAlign: 'center', pt: 3, padding: 0, fontFamily: 'oswald', fontWeight: 1 }}
        >
          Before you get started on the [subteam name] subteam, all new members will have to complete general and
          subteam-specific onboarding. Please accept this offer within 5 days to start onboarding.
        </Typography>
        <Typography
          variant="h6"
          marginLeft="auto"
          sx={{ marginTop: 1, textAlign: 'center', pt: 3, padding: 0, fontFamily: 'oswald', fontWeight: 1 }}
        >
          We can't wait to see you around and all that you'll accomplish!
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 7,
          width: '100%'
        }}
      >
        <Grid container justifyContent="center" spacing={8} sx={{ maxWidth: '300px' }}>
          <Grid item>
            <NERButton variant="contained">Accept</NERButton>
          </Grid>
          <Grid item>
            <NERButton variant="contained">Reject</NERButton>
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
};
export default AcceptedPage;
