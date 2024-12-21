import { Typography, useTheme, Grid, IconButton } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { Box } from '@mui/system';
import React from 'react';
import { Checklist } from 'shared';
import { GridDragIcon } from '@mui/x-data-grid';

const SubtaskSection: React.FC<{ parentTask: Checklist; isAdmin?: boolean }> = ({ parentTask, isAdmin = false }) => {
  const theme = useTheme();
  const { subtasks } = parentTask;
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
                <Box display={'flex'} alignItems={'center'}>
                  {isAdmin ? (
                    <IconButton>
                      <GridDragIcon sx={{ color: 'black' }} />
                    </IconButton>
                  ) : (
                    <Checkbox
                      sx={{
                        '& .MuiSvgIcon-root': {
                          fill: 'black',
                          backgroundColor: 'black',
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
          {parentTask.descriptions.map((description) => {
            return (
              <Grid
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  width: '50%',
                  padding: 2,
                  borderRadius: 2,
                  display: 'flex',
                  margin: 'auto'
                }}
              >
                <Typography color={theme.palette.common.white}>{description}</Typography>
              </Grid>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default SubtaskSection;
