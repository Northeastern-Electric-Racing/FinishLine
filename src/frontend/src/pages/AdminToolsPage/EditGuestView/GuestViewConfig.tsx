import { Stack } from '@mui/material';
import EditDescription from './EditDescription';
import EditFeaturedProjects from './EditFeaturedProjects';

const GuestViewConfig: React.FC = () => {
  return (
    <Stack spacing={2}>
      <EditDescription />
      <EditFeaturedProjects />
    </Stack>
  );
};

export default GuestViewConfig;
