import { Box, Grid } from '@mui/material';
import { groupChecklists } from '../../../utils/onboarding.utils';
import Checklist from './Checklist';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGeneralChecklists, useUsersTeamTypeChecklists } from '../../../hooks/onboarding.hook';
import ErrorPage from '../../ErrorPage';

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

  if (generalChecklistsIsError) {
    return <ErrorPage error={generalChecklistsError} />;
  }

  if (usersTeamTypeChecklistsIsError) {
    return <ErrorPage error={usersTeamTypeChecklistsError} />;
  }

  if (!generalChecklists || generalChecklistsIsLoading || usersTeamTypeChecklistsIsLoading || !usersTeamTypeChecklists) {
    return <LoadingIndicator />;
  }

  const allChecklists = [...generalChecklists, ...usersTeamTypeChecklists];
  const groupedChecklists = groupChecklists(allChecklists);

  return (
    <Box>
      <Grid container>
        {Object.entries(groupedChecklists).map(([checklistName, checklists]) => (
          <Grid item xs={12} padding={2} key={checklistName}>
            <Checklist parentChecklists={checklists} checklistName={checklistName} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ChecklistSection;
