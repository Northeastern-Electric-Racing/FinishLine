import { Box, Grid, Typography } from '@mui/material';
import OnboardingInfoSection from './OnboardingInfoSection';
import { useAllChecklists } from '../../../hooks/onboarding.hook';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { groupChecklists } from '../../../utils/onboarding.utils';
import { AdminChecklist } from './Checklists/AdminChecklist';

const AdminToolsOnboardingConfig: React.FC = () => {
  const {
    data: allChecklists,
    isLoading: allChecklistsIsLoading,
    isError: allChecklistsIsError,
    error: allChecklistsError
  } = useAllChecklists();

  if (allChecklistsIsError) {
    return <ErrorPage error={allChecklistsError} />;
  }

  if (!allChecklists || allChecklistsIsLoading) {
    return <LoadingIndicator />;
  }

  const groupedChecklists = groupChecklists(allChecklists);

  return (
    <Box padding="5px">
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Onboarding Config
      </Typography>
      <Grid container spacing={2} padding={1} sx={{ width: '100%' }}>
        <Grid item xs={12} md={7}>
          <Box>
            {Object.entries(groupedChecklists).map(([checklistName, checklists]) => (
              <Grid item xs={12} key={checklistName}>
                <AdminChecklist parentChecklists={checklists} checklistName={checklistName} />
              </Grid>
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} md={5} sx={{ width: '100%', mt: 0.5 }}>
          <OnboardingInfoSection />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsOnboardingConfig;
