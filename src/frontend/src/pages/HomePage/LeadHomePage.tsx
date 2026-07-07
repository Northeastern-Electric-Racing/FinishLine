/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Grid, Typography } from '@mui/material';
import PageLayout, { PAGE_GRID_HEIGHT } from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import ChangeRequestsToReview from './components/ChangeRequestsToReview';
import MyTeamsOverdueTasks from './components/MyTeamsOverdueTasks';
import UpcomingDesignReviews from './components/UpcomingDesignReviews';
import GeneralAnnouncements from './components/GeneralAnnouncements';

interface LeadHomePageProps {
  user: AuthenticatedUser;
}

const LeadHomePage = ({ user }: LeadHomePageProps) => {
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
          mt: 2,
          gap: 2
        }}
      >
        <Box height={'min-content'}>
          <ChangeRequestsToReview />
        </Box>
        <Grid
          container
          maxHeight={'60%'}
          spacing={2}
          style={{
            flexGrow: 1,
            display: 'flex'
          }}
        >
          <Grid
            item
            xs={12}
            md={4}
            maxHeight={'100%'}
            style={{
              minWidth: 'min-content',
              overflow: 'hidden'
            }}
          >
            <GeneralAnnouncements />
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            maxHeight={'100%'}
            style={{
              minWidth: 'min-content',
              overflow: 'hidden'
            }}
          >
            <MyTeamsOverdueTasks user={user} />
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            maxHeight={'100%'}
            style={{
              minWidth: 'min-content',
              overflow: 'hidden'
            }}
          >
            <UpcomingDesignReviews user={user} />
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
};

export default LeadHomePage;
