import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { Grid, Typography, IconButton } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { Checklist } from 'shared';
import AdminTask from './AdminTask';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export const AdminChecklist: React.FC<{ parentChecklists: Checklist[]; checklistName?: string }> = ({
  parentChecklists,
  checklistName
}) => {
  const [showTasks, setShowTasks] = useState(false);

  const toggleShowTasks = () => {
    setShowTasks((prev) => !prev);
  };

  return (
    <Box>
      <Grid container>
        <Grid item xs={12} padding={1}>
          <Box
            sx={{
              backgroundColor: showTasks ? 'white' : '#CECECE',
              padding: '2%',
              borderRadius: showTasks ? '10px 10px 0 0' : '10px',
              position: 'relative'
            }}
          >
            <Grid display="flex" alignItems="center" justifyContent="space-between">
              <Typography fontSize="2em" fontWeight="bold" color="black">
                {checklistName} Checklist
              </Typography>
              <Grid display="flex" alignItems="center" gap={2}>
                <IconButton onClick={toggleShowTasks}>
                  {showTasks ? (
                    <KeyboardArrowDown sx={{ color: 'black' }} />
                  ) : (
                    <KeyboardArrowRight sx={{ color: 'black' }} />
                  )}
                </IconButton>
              </Grid>
            </Grid>
          </Box>
          {showTasks && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: '#CECECE',
                padding: 1.5,
                alignContent: 'center',
                position: 'relative',
                borderRadius: '0px 0px 10px 10px'
              }}
            >
              {parentChecklists.map((parentChecklist) => (
                <AdminTask subtasks={parentChecklist.subtasks} parentTask={parentChecklist} />
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <IconButton sx={{ color: 'red' }}>
                  <AddCircleOutlineIcon sx={{ mr: 1 }} />
                  <Typography>Add Task</Typography>
                </IconButton>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
