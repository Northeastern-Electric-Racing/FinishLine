import React, { useState } from 'react';
import { Checklist as ChecklistType } from 'shared';
import { Typography, Grid, Box, IconButton, useTheme } from '@mui/material';
import { KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import Task from './Task';

const Checklist: React.FC<{ checklist: ChecklistType }> = ({ checklist }) => {
  const theme = useTheme();
  const parentTasks = checklist.checklistItems.filter((task) => task.parentChecklistItemId === null);
  const allChecklistItems = checklist.checklistItems;

  const [showTasks, setShowTasks] = useState(false);

  const toggleShowTasks = () => {
    setShowTasks((prev) => !prev);
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: 5 }}>
      <Grid container>
        <Grid item xs={12} padding={2.5}>
          <Grid display="flex" alignItems="center" justifyContent="space-between">
            <Typography fontSize="2em" fontWeight="bold">
              {checklist.name}
            </Typography>
            <Grid display="flex" alignItems="center" gap={2}>
              <progress value={50} max={100} />
              <IconButton onClick={toggleShowTasks}>{showTasks ? <KeyboardArrowDown /> : <KeyboardArrowRight />}</IconButton>
            </Grid>
          </Grid>
          {showTasks &&
            parentTasks.map((task) => (
              <Box
                sx={{
                  marginTop: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Task checklistItems={allChecklistItems} parentTask={task} />
              </Box>
            ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Checklist;
