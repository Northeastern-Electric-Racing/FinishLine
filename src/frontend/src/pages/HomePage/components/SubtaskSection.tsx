import { Typography, useTheme, Grid } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { Box } from '@mui/system';
import React from 'react';
import { ChecklistItem } from 'shared';

const SubtaskSection: React.FC<{ subtasks: ChecklistItem[]; parentTask: ChecklistItem }> = ({ subtasks, parentTask }) => {
  const theme = useTheme();

  return (
    <Box sx={{ backgroundColor: '#CECECE', padding: 2, marginTop: -0.5, borderRadius: '0px 0px 10px 10px' }}>
      {subtasks.length > 0 ? (
        <Grid container sx={{ display: 'flex' }}>
          <Grid item xs={12} md={7}>
            {subtasks.map((subtask) => (
              <Box marginLeft={5} display={'flex'} alignItems={'center'}>
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
            <Typography color={theme.palette.common.white}>{parentTask.description}</Typography>
          </Grid>
        </Grid>
      ) : (
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
          <Typography color={theme.palette.common.white}>{parentTask.description}</Typography>
        </Grid>
      )}
    </Box>
  );
};

export default SubtaskSection;
