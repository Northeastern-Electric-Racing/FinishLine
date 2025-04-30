import { Box } from '@mui/system';
import { Grid } from '@mui/material';
import { Typography } from '@mui/material';
import WorkPackageTemplateTable from './ProjectsConfig/WorkPackageTemplateTable';
import LinkTypeTable from './ProjectsConfig/LinkTypes/LinkTypeTable';
import DescriptionBulletTypeTable from './ProjectsConfig/DescriptionBulletTypes/DescriptionBulletTypeTable';
import CarsTable from './ProjectsConfig/CarsTable';
import PartsReviewFAQTable from './ProjectsConfig/PartsReviewFAQ/PartsReviewFAQTable';
import AbbreviationsTable from './ProjectsConfig/AbbreviationsTable';

const AdminToolsProjectsConfig: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Parts Review Config
      </Typography>
      <Grid item container direction="row" spacing={2}>
        <Grid item xs={12} md={6}>
          <AbbreviationsTable />
        </Grid>
        <Grid item xs={12} md={6}>
          <PartsReviewFAQTable />
        </Grid>
      </Grid>
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
