/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, Typography } from '@mui/material';
import OverdueWorkPackageAlerts from './OverdueWorkPackageAlerts';
import UsefulLinks from './UsefulLinks';
import WorkPackagesByTimelineStatus from './WorkPackagesByTimelineStatus';
import UpcomingDeadlines from './UpcomingDeadlines';
import { useCurrentUser, useSingleUserSettings } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout from '../../components/PageLayout';
import { useCreateMilestone } from '../../hooks/recruitment.hooks';

const Home = () => {
  const user = useCurrentUser();
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(user.userId);
  const { mutateAsync } = useCreateMilestone();
  const milestonePayload = {
    name: 'test milestone',
    description: 'test milestone description',
    dateOfEvent: new Date()
  };
  if (isLoading || !userSettingsData) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
        Welcome, {user.firstName}!
      </Typography>
      <OverdueWorkPackageAlerts />
      <UsefulLinks />
      <UpcomingDeadlines />
      <WorkPackagesByTimelineStatus />
      <Button onClick={() => mutateAsync(milestonePayload)}>Click to create milestone</Button>
    </PageLayout>
  );
};

export default Home;
