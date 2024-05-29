import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import WorkPackageTemplateTable from './ProjectsConfig/WorkPackageTemplateTable';
import LinkTypeTable from './ProjectsConfig/LinkTypeTable';
import DescriptionBulletTypeTable from './ProjectsConfig/DescriptionBulletTpeTable';
import CarsTable from './ProjectsConfig/CarsTable';

const AdminToolsProjectsConfig: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Cars Config
      </Typography>
      <CarsTable />
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Links Config
      </Typography>
      <LinkTypeTable />
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Description Bullet Types
      </Typography>
      <DescriptionBulletTypeTable />
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Work Package Templates
      </Typography>
      <WorkPackageTemplateTable />
    </Box>
  );
};

export default AdminToolsProjectsConfig;
