import { Typography, useTheme, Grid, IconButton } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { Box } from '@mui/system';
import { GridDragIcon } from '@mui/x-data-grid';
import React from 'react';
import { Checklist } from 'shared';

interface SubtaskSectionProps {
  subtasks: Checklist[];
  parentTask: Checklist;
  isAdmin?: boolean;
}

const SubtaskSection: React.FC<SubtaskSectionProps> = ({ subtasks, parentTask, isAdmin }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{ backgroundColor: '#CECECE', padding: 2, marginTop: -0.5, marginBottom: 3, borderRadius: '0px 0px 10px 10px' }}
    >
      {subtasks.length > 0 ? (
        <Grid container sx={{ display: 'flex', alignContent: 'center', justifyContent: 'center', alignItems: 'center' }}>
          <Grid item xs={12} md={7}>
            {subtasks.map((subtask) => (
              <Box marginLeft={isAdmin ? 2 : 5} display={'flex'} alignItems={'center'} marginBottom={1}>
                {isAdmin ? (
                  <IconButton
                    sx={{
                      color: '#ef4345',
                      '&:hover': {
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    <GridDragIcon sx={{ color: 'black' }}></GridDragIcon>
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
            gap: 2
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
