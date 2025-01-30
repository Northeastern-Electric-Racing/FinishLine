import { Box, Grid, Typography } from '@mui/material';
import { groupChecklists } from '../../../utils/onboarding.utils';
import Checklist from './Checklist';
import { Checklist as ChecklistType } from 'shared';

interface ChecklistSectionProps {
  usersChecklists: ChecklistType[];
  checkedChecklists: ChecklistType[];
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ usersChecklists, checkedChecklists }) => {
  const groupedChecklists = groupChecklists(usersChecklists);

  return (
    <Box>
      <Grid container>
        {Object.entries(groupedChecklists).map(([checklistName, checklists]) => (
          <Grid item xs={12} padding={2} key={checklistName}>
            <Checklist parentChecklists={checklists} checkedChecklists={checkedChecklists} checklistName={checklistName} />
          </Grid>
        ))}
      </Grid>
      {!usersChecklists.length && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100px',
            marginTop: 6
          }}
        >
          <Typography variant="h2">No checklists found</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ChecklistSection;
