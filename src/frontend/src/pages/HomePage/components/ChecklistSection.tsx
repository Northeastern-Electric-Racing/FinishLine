import React from 'react';
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
        {/* {organization.applicationLink && (
          <Grid item xs={12} padding={2}>
            <Typography variant="h5" gutterBottom>
              APPLY{' '}
              <Link target="_blank" rel="noopener noreferrer" href={organization.applicationLink}>
                HERE
              </Link>{' '}
              THEN CONTINUE
            </Typography>
          </Grid>
        )} */}
        {Object.entries(groupedChecklists).map(([checklistName, checklists]) => (
          <React.Fragment key={checklistName}>
            <Grid item xs={12} padding={2}>
              <Checklist parentChecklists={checklists} checkedChecklists={checkedChecklists} checklistName={checklistName} />
            </Grid>
          </React.Fragment>
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
