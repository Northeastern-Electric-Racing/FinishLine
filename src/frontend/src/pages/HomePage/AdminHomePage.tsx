/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography, Grid, Box } from '@mui/material';
import { useSingleUserSettings } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout, { PAGE_GRID_HEIGHT } from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import WorkPackagesSelectionView from './components/WorkPackagesSelectionView';
import ChangeRequestsToReview from './components/ChangeRequestsToReview';
import OverdueWorkPackages from './components/OverdueWorkPackages';

interface AdminHomePageProps {
  user: AuthenticatedUser;
}

const AdminHomePage = ({ user }: AdminHomePageProps) => {
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(user.userId);

  if (isLoading || !userSettingsData) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
        Welcome, {user.firstName}!
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: `${PAGE_GRID_HEIGHT}vh`,
          gap: 2,
          mt: 1
        }}
      >
        <Box height={'40%'}>
          <ChangeRequestsToReview user={user} />
        </Box>
        <Grid container height={'60%'} spacing={2}>
          <Grid item xs={7} md={7} height="100%">
            <WorkPackagesSelectionView />
          </Grid>
          <Grid item xs={5} md={5} height="100%">
            <OverdueWorkPackages user={user} />
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
};

export default AdminHomePage;
