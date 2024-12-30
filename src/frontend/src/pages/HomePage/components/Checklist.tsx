import React, { useState, useEffect } from 'react';
import { Checklist as ChecklistType, User } from 'shared';
import { Typography, Grid, Box, IconButton, useTheme } from '@mui/material';
import { KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import ParentTask from './ParentTask';
import OnboardingProgressBar from '../../../components/OnboardingProgressBar';
import { useCurrentUser } from '../../../hooks/users.hooks';

const Checklist: React.FC<{ parentChecklists: ChecklistType[]; checklistName?: string }> = ({
  parentChecklists,
  checklistName
}) => {
  const theme = useTheme();
  const [showTasks, setShowTasks] = useState(false);
  const [progress, setProgress] = useState(0);
  const user = useCurrentUser();

  const toggleShowTasks = () => {
    setShowTasks((prev) => !prev);
  };

  useEffect(() => {
    const totalChecklists = parentChecklists.length;

    const completedChecklists = parentChecklists.filter(
      (checklist) =>
        Array.isArray(checklist.usersChecked) &&
        checklist.usersChecked.some((checkedUser: User) => checkedUser.userId === user.userId)
    ).length;

    setProgress(totalChecklists > 0 ? (completedChecklists / totalChecklists) * 100 : 0);
  }, [parentChecklists, user]);

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
                <ParentTask parentTask={parentChecklist} />
              ))}
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Checklist;
