import { Box } from '@mui/system';
import LinkTypeTable from './ProjectsConfig/LinkTypeTable';
import { Typography } from '@mui/material';

const AdminToolsProjectsConfig: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Links Config
      </Typography>
      <LinkTypeTable />
    </Box>
  );
};

export default AdminToolsProjectsConfig;
