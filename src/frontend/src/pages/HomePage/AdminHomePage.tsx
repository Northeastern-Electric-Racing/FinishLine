/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography, Grid, Box } from '@mui/material';
import PageLayout, { PAGE_GRID_HEIGHT } from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import WorkPackagesSelectionView from './components/WorkPackagesSelectionView';
import ChangeRequestsToReview from './components/ChangeRequestsToReview';
import OverdueWorkPackages from './components/OverdueWorkPackages';

interface AdminHomePageProps {
  user: AuthenticatedUser;
}

const AdminHomePage = ({ user }: AdminHomePageProps) => {
  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
        Welcome, {user.firstName}!
      </Typography>
      <Typography variant="h6" sx={{ textAlign: 'center', color: 'warning.main' }}>
        🚧 Sandbox Environment
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
        <Box height={'min-content'} display="flex" flexDirection="column">
          <ChangeRequestsToReview />
        </Box>
        <Grid
          container
          spacing={2}
          height={'60%'}
          style={{
            flexGrow: 1,
            display: 'flex',
            width: '100%'
          }}
        >
          <Grid
            item
            style={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 'min-content',
              overflow: 'hidden'
            }}
          >
            <WorkPackagesSelectionView />
          </Grid>
          <Grid
            item
            height="100%"
            style={{ width: 'min-content', minWidth: 'min-content', overflow: 'hidden', flexGrow: 1 }}
          >
            <OverdueWorkPackages />
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
};

export default AdminHomePage;
