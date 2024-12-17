import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import UsefulLinksTable from './UsefulLinks/UsefulLinksTable';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import OnboardingBlock from './OnboardingBlock';

const OnboardingInfoSection: React.FC = () => {
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
    <Grid container item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 4 }}>
      <OnboardingBlock organization={organization} isAdmin={true} />
      <Grid item>
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.background.paper,
            height: '100%',
            borderRadius: '10px',
            padding: '16px'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            Useful Links
          </Typography>
          <UsefulLinksTable />
        </Box>
      </Grid>
      <Grid item>
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.grey[600],
            height: '25vh',
            borderRadius: '10px',
            padding: '16px'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            Questions
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default OnboardingInfoSection;
