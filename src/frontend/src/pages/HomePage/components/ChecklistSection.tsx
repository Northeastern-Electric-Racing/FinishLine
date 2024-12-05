import { Grid, Box } from '@mui/material';
import { useGeneralChecklists, useUsersTeamTypeChecklists } from '../../../hooks/onboarding.hook';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import Checklist from './Checklist';
import { Checklist as ChecklistType } from 'shared';

const ChecklistSection: React.FC = () => {
  const {
    data: generalChecklists,
    isError: generalChecklistsIsError,
    error: generalChecklistsError,
    isLoading: generalChecklistsIsLoading
  } = useGeneralChecklists();

  const {
    data: usersTeamTypeChecklists,
    isError: usersTeamTypeChecklistsIsError,
    error: usersTeamTypeChecklistsError,
    isLoading: usersTeamTypeChecklistsIsLoading
  } = useUsersTeamTypeChecklists();

  console.log('general checklist', generalChecklists);
  console.log('team type checklist', usersTeamTypeChecklists);

  if (!generalChecklists || generalChecklistsIsLoading || usersTeamTypeChecklistsIsLoading || !usersTeamTypeChecklists) {
    return <LoadingIndicator />;
  }

  if (generalChecklistsIsError) {
    return <ErrorPage error={generalChecklistsError} />;
  }

  if (usersTeamTypeChecklistsIsError) {
    return <ErrorPage error={usersTeamTypeChecklistsError} />;
  }

  const groupedTeamTypeChecklists = usersTeamTypeChecklists.reduce<Record<string, ChecklistType[]>>((grouped, checklist) => {
    const teamTypeName: string = checklist.teamType!.name;
    if (!grouped[teamTypeName]) {
      grouped[teamTypeName] = [];
    }
    grouped[teamTypeName].push(checklist);
    return grouped;
  }, {});

  const groupedTeamTypeChecklistsArray = Object.entries(groupedTeamTypeChecklists).map(([teamTypeName, checklists]) => ({
    teamTypeName,
    checklists
  }));

  const allChecklists = [{ teamTypeName: 'General', checklists: generalChecklists }, ...groupedTeamTypeChecklistsArray];

  return (
    <Box>
      <Grid container>
        {allChecklists.map(({ teamTypeName, checklists }) => (
          <Grid item xs={12} padding={2}>
            <Checklist parentChecklists={checklists} teamTypeName={teamTypeName} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ChecklistSection;
