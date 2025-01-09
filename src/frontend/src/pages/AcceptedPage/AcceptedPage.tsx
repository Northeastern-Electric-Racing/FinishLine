import { Typography, Box, Grid } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { TeamType } from 'shared';
import { NERButton } from '../../components/NERButton';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useHistory, useLocation } from 'react-router-dom';
import { useCurrentUser, useToggleCompletedOnboarding } from '../../hooks/users.hooks';
import { routes } from '../../utils/routes';
import { useToggleOnboardingUser } from '../../hooks/team-types.hooks';

const AcceptedPage = () => {
  const location = useLocation();
  const history = useHistory();
  const user = useCurrentUser();

  // is there a better way to pass in props to this page because I am navigating to this page using history.push
  // so i can't pass in props normally
  const { teamType } = location.state as { teamType: TeamType };

  const { mutateAsync: toggleCompletedOnboarding, isLoading: toggleCompletedOnboardingIsLoading } =
    useToggleCompletedOnboarding();
  const { mutateAsync: toggleOnboardingUser, isLoading: toggleOnboardingIsLoading } = useToggleOnboardingUser(
    teamType.teamTypeId
  );

  // const { mutateAsync: setTeamInitialMember, isLoading: setTeamMembersIsLoading } = useSetTeamInitialMember(team.teamId);

  if (toggleCompletedOnboardingIsLoading || toggleOnboardingIsLoading) {
    return <LoadingIndicator />;
  }

  const handleClick = async () => {
    await toggleCompletedOnboarding();
    await toggleOnboardingUser();
    // await setTeamInitialMember(user.userId);
    window.location.reload();
  };

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
          We are so excited to welcome you to Northeastern Electric Racing {teamType.name} team!
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
          marginTop: 4
        }}
      />
      <Box sx={{ mt: 2, ml: 2 }}>
        <Typography
          variant="h6"
          marginLeft="auto"
          sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0, fontFamily: 'oswald', fontWeight: 1, fontSize: 25 }}
        >
          Before you get started on the {teamType.name} team, all new members will have to complete general and
          subteam-specific onboarding.
        </Typography>
        <Typography
          variant="h6"
          marginLeft="auto"
          sx={{ marginTop: 1, textAlign: 'center', pt: 3, padding: 0, fontFamily: 'oswald', fontWeight: 1, fontSize: 25 }}
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
        <Grid container justifyContent="center" spacing={8} sx={{ maxWidth: '500px' }}>
          <Grid item>
            <NERButton variant="contained" sx={{ fontSize: 20 }} onClick={handleClick}>
              Accept
            </NERButton>
          </Grid>
          <Grid item>
            <NERButton variant="contained" sx={{ fontSize: 20 }} onClick={() => history.push(routes.HOME_SELECT_SUBTEAM)}>
              Reject
            </NERButton>
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
};
export default AcceptedPage;
