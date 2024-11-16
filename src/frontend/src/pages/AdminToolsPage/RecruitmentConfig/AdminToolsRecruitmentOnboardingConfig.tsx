import { Box, Grid, Typography } from '@mui/material';
import MilestoneTable from './MilestoneTable';
import FAQsTable from './FAQTable';
import ApplicationLinkTable from './ApplicationLinkTable';
import ChecklistTable from '../OnboardingConfig/ChecklistTable';

const AdminToolsRecruitmentOnboardingConfig: React.FC = () => {
  return (
    <Box padding="5px">
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Recruitment Config
      </Typography>
      <Grid container spacing="3%">
        <Grid item direction="column" xs={12} md={6}>
          <FAQsTable />
        </Grid>
        <Grid item direction="column" xs={12} md={6}>
          <MilestoneTable />
        </Grid>
      </Grid>
      <Grid>
        <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
          Onboarding Config
        </Typography>
        <ChecklistTable />
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
            Links Config
          </Typography>
          <ApplicationLinkTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsRecruitmentOnboardingConfig;
