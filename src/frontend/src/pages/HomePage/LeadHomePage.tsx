/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid, Typography } from '@mui/material';
import { useSingleUserSettings } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout, { PAGE_GRID_HEIGHT } from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import MyTeamsOverdueTasks from './components/MyTeamsOverdueTasks';
import UpcomingDesignReviews from './components/UpcomingDesignReviews';

interface LeadHomePageProps {
  user: AuthenticatedUser;
}

const LeadHomePage = ({ user }: LeadHomePageProps) => {
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(user.userId);

  if (isLoading || !userSettingsData) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
        Welcome, {user.firstName}!
      </Typography>
      <Grid container height={`${PAGE_GRID_HEIGHT}vh`}>
        <Grid item xs={12} md={6} height={'100%'}>
          <MyTeamsOverdueTasks user={user} />
        </Grid>
        <Grid item xs={12} md={6} height={'100%'}>
          <UpcomingDesignReviews user={user} />
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default LeadHomePage;
