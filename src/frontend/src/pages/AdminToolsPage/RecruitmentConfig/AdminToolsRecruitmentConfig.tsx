import { Box, Grid, Typography } from '@mui/material';
import MilestoneTable from './MilestoneTable';
import FAQsTable from './FAQTable';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import ApplicationLinkTable from './ApplicationLinkTable';

const AdminToolsRecruitmentConfig: React.FC = () => {
  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();

  if (organizationIsError) {
    return <ErrorPage message={organizationError.message} />;
  }

  if (!organization || organizationIsLoading) return <LoadingIndicator />;

  return (
    <Box padding="5px">
      <Grid container spacing="3%">
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor="white">
            FAQs
          </Typography>
          <FAQsTable />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor="white">
            Milestones
          </Typography>
          <MilestoneTable />
        </Grid>
        <Grid item xs={12} md={6}>
          <ApplicationLinkTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsRecruitmentConfig;
