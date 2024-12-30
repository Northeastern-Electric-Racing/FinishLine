import { Typography, useTheme, Grid, IconButton } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { Box } from '@mui/system';
import React, { useState, useEffect } from 'react';
import { Checklist } from 'shared';
import { GridDragIcon } from '@mui/x-data-grid';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { useToggleChecklist } from '../../../hooks/onboarding.hook';

const SubtaskSection: React.FC<{ subtasks: Checklist[]; parentTask: Checklist; isAdmin?: boolean }> = ({
  subtasks,
  parentTask,
  isAdmin = false
}) => {
  const theme = useTheme();
  const user = useCurrentUser();
  const { mutateAsync: toggleChecklist } = useToggleChecklist();
  const [checkedSubtasks, setCheckedSubtasks] = useState<string[]>([]);

  useEffect(() => {
    const checkedSubtaskIds = parentTask.subtasks
      .filter((subtask) => subtask.usersChecked?.some((checkedUser) => checkedUser.userId === user.userId))
      .map((subtask) => subtask.name);

    setCheckedSubtasks(checkedSubtaskIds);
  }, [parentTask.subtasks, user]);

  const handleCheckboxChange = async (subtaskName: string) => {
    const subtask = parentTask.subtasks.find((sub) => sub.name === subtaskName);
    if (!subtask) return;

    const newState = [...checkedSubtasks];
    const index = newState.indexOf(subtaskName);

    if (index === -1) {
      newState.push(subtaskName);
      await toggleChecklist(subtask.checklistId);
    } else {
      newState.splice(index, 1);
      await toggleChecklist(subtask.checklistId);
    }

    setCheckedSubtasks(newState);
  };

  return (
    <Box
      sx={
        isAdmin
          ? {}
          : {
              padding: 2,
              marginTop: -0.5,
              marginBottom: 3,
              borderRadius: '0px 0px 10px 10px',
              backgroundColor: '#CECECE'
            }
      }
    >
      {subtasks.length > 0 ? (
        <Grid container sx={{ display: 'flex', alignContent: 'center', justifyContent: 'center', alignItems: 'center' }}>
          <Grid item xs={12} md={7}>
            <Box display="flex" flexDirection="column" marginLeft={5} gap={1}>
              {subtasks.map((subtask) => (
                <Box display={'flex'} alignItems={'center'} key={subtask.checklistId}>
                  {isAdmin ? (
                    <IconButton>
                      <GridDragIcon sx={{ color: 'black' }} />
                    </IconButton>
                  ) : (
                    <Checkbox
                      checked={checkedSubtasks.includes(subtask.name)}
                      onChange={() => handleCheckboxChange(subtask.name)}
                      sx={{
                        '& .MuiSvgIcon-root': {
                          fill: 'black',
                          backgroundCpolor: 'black',
                          borderRadius: 1
                        },
                        '&.Mui-checked .MuiSvgIcon-root': {
                          backgroundColor: 'white'
                        },
                        '&:hover': {
                          backgroundColor: 'transparent'
                        }
                      }}
                    />
                  )}
                  <Typography color={'black'} fontWeight={'bold'}>
                    {subtask.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              backgroundColor: theme.palette.background.paper,
              padding: 2,
              borderRadius: 2
            }}
          >
            <Typography color={theme.palette.common.white}>{parentTask.descriptions[0]}</Typography>
          </Grid>
        </Grid>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            marginTop: isAdmin ? 1 : 0
          }}
        >
          {parentTask.descriptions.map((description) => (
            <Grid
              sx={{
                backgroundColor: theme.palette.background.paper,
                width: '50%',
                padding: 2,
                borderRadius: 2,
                display: 'flex',
                margin: 'auto'
              }}
              key={description}
            >
              <Typography color={theme.palette.common.white}>{description}</Typography>
            </Grid>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SubtaskSection;
