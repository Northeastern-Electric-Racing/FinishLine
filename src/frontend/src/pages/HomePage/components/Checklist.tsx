import React, { useState } from 'react';
import { Checklist as ChecklistType, isAdmin } from 'shared';
import { Typography, Grid, Box, IconButton, useTheme, Button } from '@mui/material';
import { KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import Task from './Task';
import AddIcon from '@mui/icons-material/Add';
import { useCurrentUser } from '../../../hooks/users.hooks';

const Checklist: React.FC<{ parentChecklists: ChecklistType[]; checklistName?: string }> = ({
  parentChecklists,
  checklistName
}) => {
  const theme = useTheme();
  const currentUser = useCurrentUser();
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
              {checklistName ?? 'General'} Checklist
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
              {parentChecklists.map((parentChecklist) => (
                <Task subtasks={parentChecklist.subtasks} parentTask={parentChecklist} />
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'right', marginBottom: '2vh', marginRight: '1vh' }}>
        {isAdmin(currentUser.role) && showTasks && (
          <Button
            variant="text"
            startIcon={<AddIcon />}
            sx={{
              color: '#ef4345',
              '&:hover': {
                backgroundColor: 'transparent'
              }
            }}
          >
            Add Task
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Checklist;
