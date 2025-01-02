import { Box, Grid } from '@mui/material';
import { groupChecklists } from '../../../utils/onboarding.utils';
import Checklist from './Checklist';
import { Checklist as ChecklistType } from 'shared';

interface ChecklistSectionProps {
  usersChecklists: ChecklistType[];
  checkedChecklists: ChecklistType[];
  generalChecklists: ChecklistType[];
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ usersChecklists, checkedChecklists, generalChecklists }) => {
  const allChecklists = [...generalChecklists, ...usersChecklists];
  const groupedChecklists = groupChecklists(allChecklists);
  console.log(groupedChecklists);
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
