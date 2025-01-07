import { Stack, Grid } from '@mui/material';
import EditDescription from './EditDescription';
import EditFeaturedProjects from './EditFeaturedProjects';
import EditLogo from './EditLogo';

const GuestViewConfig: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Stack spacing={2}>
          <EditDescription />
          <EditFeaturedProjects />
        </Stack>
      </Grid>
      <Grid item xs={6}>
        <EditLogo />
      </Grid>
    </Grid>
  );
};

export default GuestViewConfig;
