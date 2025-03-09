import LoadingIndicator from '../../../../components/LoadingIndicator';
import { Box } from '@mui/system';
import { Grid, FormGroup, FormControlLabel, Switch, SwitchProps, styled, Typography } from '@mui/material';
import { useState } from 'react';

const NERSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 34,
  height: 18,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#ef4345' : '#ef4345',
        opacity: 1,
        border: 0
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5
      }
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#ef4345',
      border: '6px solid #fff'
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600]
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3
    }
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 14,
    height: 14
  },
  '& .MuiSwitch-track': {
    borderRadius: 18 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500
    })
  }
}));

const PartsReviewPage = () => {
  const [showSubmissionGuide, setShowSubmissionGuide] = useState(false);

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormGroup>
            <FormControlLabel
              label="View Submission Guide?"
              control={
                <NERSwitch
                  sx={{ m: 1 }}
                  checked={showSubmissionGuide}
                  onChange={() => setShowSubmissionGuide(!showSubmissionGuide)}
                />
              }
            />
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          {showSubmissionGuide ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h4">Submission Guide</Typography>
                {/* Submission Guide components will go here */}
                <LoadingIndicator />\{/* This will be replaced by a grid of all the part cards */}
              </Grid>
            </Grid>
          ) : (
            <LoadingIndicator /> /* This will be replaced by a grid of all the part cards */
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default PartsReviewPage;
