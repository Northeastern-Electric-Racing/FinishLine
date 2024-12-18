import { Grid, Box } from '@mui/material';
import { useGeneralChecklists, useUsersTeamTypeChecklists } from '../../../hooks/onboarding.hook';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import Checklist from './Checklist';
import { Checklist as ChecklistType } from 'shared';

interface ChecklistSectionProps {
  isAdmin?: boolean;
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ isAdmin }) => {
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

  const groupedChecklists = usersTeamTypeChecklists.reduce<Record<string, ChecklistType[]>>(
    (groupedChecklists, checklist) => {
      let checklistName: string;
      if (checklist.teamType) {
        checklistName = checklist.teamType.name;
      } else if (checklist.team) {
        checklistName = checklist.team?.teamName;
      } else {
        checklistName = 'General';
      }

      if (!groupedChecklists[checklistName]) {
        groupedChecklists[checklistName] = [];
      }
      groupedChecklists[checklistName].push(checklist);
      return groupedChecklists;
    },
    {}
  );

  const groupedChecklistsArray = Object.entries(groupedChecklists).map(([checklistName, checklists]) => ({
    checklistName,
    checklists
  }));

  const allChecklists = [{ checklistName: 'General', checklists: generalChecklists }, ...groupedChecklistsArray];

  return (
    <Box>
      <Grid container>
        {allChecklists.map(({ checklistName, checklists }) => (
          <Grid item xs={12} padding={2}>
            <Checklist parentChecklists={checklists} checklistName={checklistName} isAdmin={isAdmin} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ChecklistSection;
