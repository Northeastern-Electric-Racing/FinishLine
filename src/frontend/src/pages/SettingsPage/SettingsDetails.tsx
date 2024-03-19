import { useAuth } from '../../hooks/auth.hooks';
import { Grid, Typography } from '@mui/material';
import DetailDisplay from '../../components/DetailDisplay';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageLayout from '../../components/PageLayout';
import { useCurrentUser, useCurrentUserSecureSettings, useSingleUserSettings } from '../../hooks/users.hooks';
import ErrorPage from '../ErrorPage';
import { useAllTeams } from '../../hooks/teams.hooks';
import { displayEnum } from '../../utils/pipes';

const SettingsDetails: React.FC = () => {
  const auth = useAuth();
  const user = useCurrentUser();
  const {
    isLoading: settingsIsLoading,
    isError: settingsIsError,
    error: settingsError,
    data: userSettingsData
  } = useSingleUserSettings(user.userId);
  const {
    isLoading: secureSettingsIsLoading,
    isError: secureSettingsIsError,
    error: secureSettingsError,
    data: userSecureSettings
  } = useCurrentUserSecureSettings();
  const { isLoading: allTeamsIsLoading, isError: allTeamsIsError, data: teams, error: allTeamsError } = useAllTeams();

  if (secureSettingsIsError) return <ErrorPage error={secureSettingsError} message={secureSettingsError.message} />;
  if (settingsIsError) return <ErrorPage error={settingsError} message={settingsError.message} />;
  if (allTeamsIsError) return <ErrorPage error={allTeamsError} message={allTeamsError.message} />;
  if (
    auth.isLoading ||
    !auth.user ||
    settingsIsLoading ||
    !userSettingsData ||
    secureSettingsIsLoading ||
    !userSecureSettings ||
    allTeamsIsLoading ||
    !teams
  )
    return <LoadingIndicator />;

  const userTeams = teams.filter((team) =>
    team.members.some((member) => member.userId === user.userId || team.head.userId === user.userId)
  );

  return (
    <PageLayout>
      <Typography variant="h5" mb={1}>
        User Details
      </Typography>
      <Grid container direction="column" spacing={0.5}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DetailDisplay label="First Name" content={user.firstName} />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <DetailDisplay label="Last Name" content={user.lastName} />
        </Grid>
        <Grid item xs={12} sm={7} md={5} lg={3}>
          <DetailDisplay label="Email" content={user.email} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DetailDisplay label="Role" content={displayEnum(user.role)} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DetailDisplay
            label="Teams"
            content={userTeams.length === 0 ? 'None' : userTeams.map((team) => team.teamName).join(', ')}
          />
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default SettingsDetails;
