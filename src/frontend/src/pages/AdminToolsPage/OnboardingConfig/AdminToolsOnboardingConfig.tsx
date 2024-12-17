import { Box, Grid, Typography } from '@mui/material';
import OnboardingInfoSection from './OnboardingInfoSection';
import ChecklistSection from '../../HomePage/components/ChecklistSection';

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
          <Grid item xs={12} md={7}>
            <ChecklistSection />
          </Grid>
          <OnboardingInfoSection />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsOnboardingConfig;
