import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';

const OnboardingInfoSection: React.FC = () => {
  return (
    <Grid container item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 4 }}>
      {/* This will be replaced with the 'Onboarding' block*/}
      <Grid item>
        <Box
          sx={{
            backgroundColor: 'gray',
            height: '25vh',
            borderRadius: '10px'
          }}
        >
          <Typography>Onboarding</Typography>
        </Box>
      </Grid>
      {/* This will be replaced with the 'Useful Links' block*/}
      <Grid item>
        <Box
          sx={{
            backgroundColor: 'gray',
            height: '25vh',
            borderRadius: '10px'
          }}
        >
          <Typography>Useful Links</Typography>
        </Box>
      </Grid>
      {/* This will be replaced with the 'Questions' block*/}
      <Grid item>
        <Box
          sx={{
            backgroundColor: 'gray',
            height: '25vh',
            borderRadius: '10px'
          }}
        >
          <Typography>Questions</Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default OnboardingInfoSection;
