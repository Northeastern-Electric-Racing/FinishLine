import { Box } from '@mui/system';
import LinkTypeTable from './ProjectsConfig/LinkTypeTable';
import { Typography } from '@mui/material';

const AdminToolsProjectsConfig: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Projects Config
      </Typography>
      <LinkTypeTable />
    </Box>
  );
};

export default AdminToolsProjectsConfig;
