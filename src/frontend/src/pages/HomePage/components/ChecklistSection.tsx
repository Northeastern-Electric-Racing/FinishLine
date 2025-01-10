import { Box, Grid } from '@mui/material';
import { groupChecklists } from '../../../utils/onboarding.utils';
import Checklist from './Checklist';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAllChecklists, useCheckedChecklists, useUsersTeamTypeChecklists } from '../../../hooks/onboarding.hook';
import ErrorPage from '../../ErrorPage';

const ChecklistSection: React.FC = () => {
  const {
    data: checklists,
    isError: checklistsIsError,
    error: checklistsError,
    isLoading: checklistsIsLoading
  } = useAllChecklists();

  const {
    data: usersTeamTypeChecklists,
    isError: usersTeamTypeChecklistsIsError,
    error: usersTeamTypeChecklistsError,
    isLoading: usersTeamTypeChecklistsIsLoading
  } = useUsersTeamTypeChecklists();

  const {
    data: checkedChecklists,
    isError: checkedChecklistsIsError,
    error: checkedChecklistsError,
    isLoading: checkedChecklistsLoading
  } = useCheckedChecklists();

  if (checklistsIsError) {
    return <ErrorPage error={checklistsError} />;
  }

  if (checkedChecklistsIsError) {
    return <ErrorPage error={checkedChecklistsError} />;
  }

  if (usersTeamTypeChecklistsIsError) {
    return <ErrorPage error={usersTeamTypeChecklistsError} />;
  }

  if (
    !checklists ||
    checklistsIsLoading ||
    usersTeamTypeChecklistsIsLoading ||
    !usersTeamTypeChecklists ||
    !checkedChecklists ||
    checkedChecklistsLoading
  ) {
    return <LoadingIndicator />;
  }

  const groupedChecklists = groupChecklists(usersTeamTypeChecklists);

  return (
    <Box>
      <Grid container>
        {Object.entries(groupedChecklists).map(([checklistName, checklists]) => (
          <Grid item xs={12} padding={2} key={checklistName}>
            <Checklist parentChecklists={checklists} checkedChecklists={checkedChecklists} checklistName={checklistName} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ChecklistSection;
