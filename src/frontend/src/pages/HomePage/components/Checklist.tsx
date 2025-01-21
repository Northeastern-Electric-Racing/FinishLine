import React, { useState } from 'react';
import { Checklist as ChecklistType } from 'shared';
import { Typography, Grid, Box, IconButton, useTheme } from '@mui/material';
import { KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import ParentTask from './ParentTask';
import OnboardingProgressBar from '../../../components/OnboardingProgressBar';
import { useChecklistProgress } from '../../../hooks/onboarding.hook';

const Checklist: React.FC<{
  parentChecklists: ChecklistType[];
  checkedChecklists: ChecklistType[];
  checklistName?: string;
}> = ({ parentChecklists, checkedChecklists, checklistName }) => {
  const theme = useTheme();
  const [showTasks, setShowTasks] = useState(false);
  const progress = useChecklistProgress(parentChecklists, checkedChecklists);

  const toggleShowTasks = () => {
    setShowTasks((prev) => !prev);
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: 5, p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} container justifyContent="space-between" alignItems="center" sx={{ flexGrow: 1 }}>
          <Typography fontSize="2em" fontWeight="bold" sx={{ marginRight: 2 }}>
            {checklistName ?? 'General'} Checklist
          </Typography>
          <Box sx={{ flexGrow: 1, mx: 2 }}>
            <OnboardingProgressBar value={progress} />
          </Box>
          <IconButton onClick={toggleShowTasks}>{showTasks ? <KeyboardArrowDown /> : <KeyboardArrowRight />}</IconButton>
        </Grid>
        {showTasks && (
          <Grid item xs={12}>
            <Box
              sx={{
                marginTop: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {parentChecklists.map((parentChecklist) => (
                <ParentTask parentTask={parentChecklist} checkedChecklists={checkedChecklists} />
              ))}
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Checklist;
