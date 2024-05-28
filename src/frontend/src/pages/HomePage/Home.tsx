/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography, Button } from '@mui/material';
import OverdueWorkPackageAlerts from './OverdueWorkPackageAlerts';
import UsefulLinks from './UsefulLinks';
import WorkPackagesByTimelineStatus from './WorkPackagesByTimelineStatus';
import UpcomingDeadlines from './UpcomingDeadlines';
import { useCurrentUser, useSingleUserSettings } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout from '../../components/PageLayout';
import { useDeleteWorkPackageTemplate } from '../../hooks/work-packages.hooks';

const Home = () => {
  const user = useCurrentUser();
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(user.userId);
  const { mutateAsync } = useDeleteWorkPackageTemplate();

  if (isLoading || !userSettingsData) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  const handleDelete = async () => {
    await mutateAsync('1a8a92c5-c05f-4078-aba4-94c233a17ea9');
  };

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
        Welcome, {user.firstName}!
      </Typography>
      <OverdueWorkPackageAlerts />
      <UsefulLinks />
      <UpcomingDeadlines />
      <WorkPackagesByTimelineStatus />
      <Button onClick={handleDelete}> Click me</Button>
    </PageLayout>
  );
};

export default Home;
