import { Typography, Grid } from '@mui/material';
import { Box } from '@mui/system';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAllChecklists } from '../../../hooks/onboarding.hook';
import { useAllTeamTypes } from '../../../hooks/team-types.hooks';
import { groupChecklists, sortGroupNames } from '../../../utils/onboarding.utils';
import ErrorPage from '../../ErrorPage';
import { AdminChecklist } from './Checklists/AdminChecklist';
import OnboardingInfoSection from './OnboardingInfoSection';
import { Checklist } from 'shared';

type GroupedChecklists = Record<string, Checklist[]>; // Change made here

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

  if (allChecklistsIsError) {
    return <ErrorPage error={allChecklistsError} />;
  }

  if (teamTypesIsError) {
    return <ErrorPage error={teamTypesError} />;
  }

  if (!allChecklists || allChecklistsIsLoading || !teamTypes || teamTypesIsLoading) {
    return <LoadingIndicator />;
  }

  const existingGroupedChecklists = groupChecklists(allChecklists);

  const groupedChecklists: GroupedChecklists = teamTypes.reduce((acc, teamType) => {
    acc[teamType.name] = existingGroupedChecklists[teamType.name] || [];
    return acc;
  }, {} as GroupedChecklists);

  groupedChecklists['General'] = existingGroupedChecklists['General'] || [];

  const sortedGroupNames = sortGroupNames(groupedChecklists);

  return (
    <Box padding="5px">
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Onboarding Config
      </Typography>
      <Grid container spacing={2} padding={1} sx={{ width: '100%' }}>
        <Grid item xs={12} md={7}>
          <Box>
            {Object.entries(sortedGroupNames).map(([checklistName, checklists]) => {
              const teamType = teamTypes.find((team) => team.name === checklistName);

              return (
                <Grid item xs={12} key={checklistName}>
                  <AdminChecklist parentChecklists={checklists} checklistName={checklistName} teamType={teamType} />
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
