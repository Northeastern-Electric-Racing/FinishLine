/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography } from '@mui/material';
import OverdueWorkPackageAlerts from './components/OverdueWorkPackageAlerts';
import UsefulLinks from './components/UsefulLinks';
import WorkPackagesByTimelineStatus from './components/WorkPackagesByTimelineStatus';
import UpcomingDeadlines from './components/UpcomingDeadlines';
import { useSingleUserSettings } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';

interface MemberHomePageProps {
  user: AuthenticatedUser;
}

const MemberHomePage = ({ user }: MemberHomePageProps) => {
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(user.userId);

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
    </PageLayout>
  );
};

export default MemberHomePage;
