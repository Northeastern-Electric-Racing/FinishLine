/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Grid, Typography } from '@mui/material';
import { useSingleUserSettings } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import UnreviewedChangeRequests from './components/UnreviewedChangeRequests';
import MyTeamsOverdueTasks from './components/MyTeamsOverdueTasks';

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
      <UnreviewedChangeRequests user={user} />
      <Box sx={{ flexGrow: 1 }}>
        <Grid container>
          <Grid item xs={12} md={6}>
            <MyTeamsOverdueTasks user={user} />
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
};

export default LeadHomePage;
