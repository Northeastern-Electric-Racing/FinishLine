import { Box, Grid, Typography } from '@mui/material';
import OnboardingInfoSection from './OnboardingInfoSection';

const AdminToolsOnboardingConfig: React.FC = () => {
  return (
    <Box padding="5px">
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Onboarding Config
      </Typography>
      <Grid
        container
        spacing={3}
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Grid container display={'flex'}>
          {/* This will be replaced with the 'Checklist' component*/}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                height: '80vh',
                width: '100%',
                mt: 4
              }}
            >
              <Box
                sx={{
                  backgroundColor: 'gray',
                  height: '100%',
                  width: '95%',
                  borderRadius: '10px',
                  overflow: 'auto'
                }}
              >
                <Typography>Checklists</Typography>
              </Box>
            </Box>
          </Grid>
          <OnboardingInfoSection />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsOnboardingConfig;
