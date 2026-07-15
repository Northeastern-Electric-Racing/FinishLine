import { Box } from '@mui/system';
import { Grid } from '@mui/material';
import { Typography } from '@mui/material';
import WorkPackageTemplateTable from './ProjectsConfig/WorkPackageTemplateTable';
import ProjectTemplateTable from './ProjectsConfig/ProjectTemplateTable';
import LinkTypeTable from './ProjectsConfig/LinkTypes/LinkTypeTable';
import DescriptionBulletTypeTable from './ProjectsConfig/DescriptionBulletTypes/DescriptionBulletTypeTable';
import CarsTable from './ProjectsConfig/CarsTable';
import PartsReviewFAQTable from './ProjectsConfig/PartsReviewFAQ/PartsReviewFAQTable';
import AbbreviationsTable from './ProjectsConfig/AbbreviationsTable';
import ConfluenceLink from './ProjectsConfig/ConfluenceLink';
import PartReviewSampleImage from './ProjectsConfig/PartReviewSampleImage';
import CommonMistakesTable from './ProjectsConfig/CommonMistakesTable';
import PartTagsTable from './ProjectsConfig/PartTagsTable';
import TaskLabelsTable from './ProjectsConfig/TaskLabelsTable';

const AdminToolsProjectsConfig: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Parts Review Config
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <AbbreviationsTable />
          <ConfluenceLink />
          <PartReviewSampleImage />
        </Grid>
        <Grid item xs={12} md={6}>
          <PartTagsTable />
          <PartsReviewFAQTable />
          <CommonMistakesTable />
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
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Project Templates
      </Typography>
      <ProjectTemplateTable />
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Task Labels
      </Typography>
      <TaskLabelsTable />
    </Box>
  );
};

export default AdminToolsProjectsConfig;
