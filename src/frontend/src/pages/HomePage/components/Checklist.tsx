import React, { useState } from 'react';
import { Checklist as ChecklistType } from 'shared';
import { Typography, Grid, Box, IconButton, useTheme } from '@mui/material';
import { KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import Task from './Task';

const Checklist: React.FC<{ parentChecklist: ChecklistType; teamTypeName?: string }> = ({
  parentChecklist,
  teamTypeName
}) => {
  console.log('parentChecklist', parentChecklist);
  const { subtasks } = parentChecklist;
  const theme = useTheme();
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
              {teamTypeName ?? 'General'} Checklist
            </Typography>
            <Grid display="flex" alignItems="center" gap={2}>
              <progress value={50} max={100} />
              <IconButton onClick={toggleShowTasks}>{showTasks ? <KeyboardArrowDown /> : <KeyboardArrowRight />}</IconButton>
            </Grid>
          </Grid>
          {showTasks && (
            <Box
              sx={{
                marginTop: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Task subtasks={subtasks} parentTask={parentChecklist} />
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Checklist;
