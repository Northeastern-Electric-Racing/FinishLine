import { Grid, Box } from '@mui/material';
import { useGeneralChecklist, useUsersTeamTypeChecklists } from '../../../hooks/onboarding.hook';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import Checklist from './Checklist';

const ChecklistSection: React.FC = () => {
  const {
    data: generalChecklist,
    isError: generalChecklistIsError,
    error: generalChecklistError,
    isLoading: generalChecklistIsLoading
  } = useGeneralChecklist();

  const {
    data: usersTeamTypeChecklists,
    isError: usersTeamTypeChecklistsIsError,
    error: usersTeamTypeChecklistsError,
    isLoading: usersTeamTypeChecklistsIsLoading
  } = useUsersTeamTypeChecklists();

  console.log('general checklist', generalChecklist);
  console.log('team type checklist', usersTeamTypeChecklists);

  if (!generalChecklist || generalChecklistIsLoading || usersTeamTypeChecklistsIsLoading || !usersTeamTypeChecklists) {
    return <LoadingIndicator />;
  }
  if (generalChecklistIsError) {
    return <ErrorPage error={generalChecklistError} />;
  }

  if (usersTeamTypeChecklistsIsError) {
    return <ErrorPage error={usersTeamTypeChecklistsError} />;
  }

  const allChecklists = [generalChecklist, usersTeamTypeChecklists];

  return (
    <Box>
      <Grid container>
        {allChecklists.map((checklist) => {
          console.log(checklist);
          return (
            <Grid item xs={12} padding={2}>
              <Checklist parentChecklist={checklist} teamType={checklist.teamType?.name}/>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ChecklistSection;
