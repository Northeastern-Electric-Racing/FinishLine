import { Typography, Box } from '@mui/material';
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
        <Typography variant="h3" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
          Congratulations, {user.firstName}!
        </Typography>
        <Typography variant="h4" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 1, padding: 0 }}>
          We are so excited to welcome you to Northeastern Electric Racing!
        </Typography>
      </Box>
      <Box />
      <Box sx={{ mt: 4, ml: 2 }}>
        <Typography variant="body1" marginLeft="auto" sx={{ marginTop: 50, textAlign: 'center', pt: 3, padding: 0 }}>
          Before you get started on the [subteam name] subteam, all new members will have to complete general and
          subteam-specific onboarding. Please accept this offer within 5 days to start onboarding.
        </Typography>
        <Typography variant="body1" marginLeft="auto" sx={{ textAlign: 'center', pt: 3, padding: 0 }}>
          We can't wait to see you around and all that you'll accomplish!
        </Typography>
      </Box>
      <Box sx={{ mt: 15, ml: 2 }}>
        <NERButton sx={{ mt: '20px', float: 'left' }} variant="contained">
          Accept
        </NERButton>
        <NERButton sx={{ mt: '20px', float: 'right' }} variant="contained">
          Reject
        </NERButton>
      </Box>
    </PageLayout>
  );
};
export default AcceptedPage;
