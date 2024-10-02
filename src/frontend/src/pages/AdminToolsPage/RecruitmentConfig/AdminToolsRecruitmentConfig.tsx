import { Box, Grid, Typography } from '@mui/material';
import MilestoneTable from './MilestoneTable';
import FAQsTable from './FAQTable';
import ApplicationLinkTable from './ApplicationLinkTable';

const AdminToolsRecruitmentConfig: React.FC = () => {
  return (
    <Box padding="5px">
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Recruitment Config
      </Typography>
      <Grid container spacing="3%">
        <Grid item direction="column" xs={12} md={6}>
          <FAQsTable />
        </Grid>
        <Grid item direction="column" alignSelf="right" xs={12} md={6}>
          <MilestoneTable />
        </Grid>
        <Grid item direction="column" xs={12} md={6}>
          <ApplicationLinkTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsRecruitmentConfig;