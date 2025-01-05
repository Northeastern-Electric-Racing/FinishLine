import { Typography, Grid } from '@mui/material';
import { Box } from '@mui/system';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAllChecklists } from '../../../hooks/onboarding.hook';
import { useAllTeamTypes } from '../../../hooks/team-types.hooks';
import { groupAndSortChecklists } from '../../../utils/onboarding.utils';
import ErrorPage from '../../ErrorPage';
import { AdminChecklist } from './Checklists/AdminChecklist';
import OnboardingInfoSection from './OnboardingInfoSection';
import { useAllTeams } from '../../../hooks/teams.hooks';

const AdminToolsOnboardingConfig: React.FC = () => {
  const {
    data: allChecklists,
    isLoading: allChecklistsIsLoading,
    isError: allChecklistsIsError,
    error: allChecklistsError
  } = useAllChecklists();

  const {
    data: teamTypes,
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    error: teamTypesError
  } = useAllTeamTypes();

  const { data: allTeams, isLoading: teamsIsLoading, isError: teamsIsError, error: teamsError } = useAllTeams();

  if (allChecklistsIsError) {
    return <ErrorPage error={allChecklistsError} />;
  }

  if (teamTypesIsError) {
    return <ErrorPage error={teamTypesError} />;
  }

  if (teamsIsError) {
    return <ErrorPage error={teamsError} />;
  }

  if (!allChecklists || allChecklistsIsLoading || !teamTypes || teamTypesIsLoading || !allTeams || teamsIsLoading) {
    return <LoadingIndicator />;
  }

  const groupedChecklists = groupAndSortChecklists(allChecklists, teamTypes, allTeams);

  return (
    <Box padding="5px">
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Onboarding Config
      </Typography>
      <Grid container spacing={2} padding={1} sx={{ width: '100%' }}>
        <Grid item xs={12} md={7}>
          <Box>
            {Object.entries(groupedChecklists).map(([checklistName, checklists]) => {
              const teamType = teamTypes.find((team) => team.name === checklistName);
              const team = allTeams.find((team) => team.teamName === checklistName);

              return (
                <Grid item xs={12} key={checklistName}>
                  <AdminChecklist
                    parentChecklists={checklists}
                    checklistName={checklistName}
                    teamType={teamType}
                    team={team}
                  />
                </Grid>
              );
            })}
          </Box>
        </Grid>
        <Grid item xs={12} md={5} sx={{ width: '100%', mt: 0.5 }}>
          <OnboardingInfoSection />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsOnboardingConfig;
