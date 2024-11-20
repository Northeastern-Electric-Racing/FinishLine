/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography } from '@mui/material';
import { useSingleUserSettings, useUserNotifications } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import NotificationCard from '../../components/NotificationCard';

interface AdminHomePageProps {
  user: AuthenticatedUser;
}

const AdminHomePage = ({ user }: AdminHomePageProps) => {
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(user.userId);
  const {
    data: notifications,
    isLoading: notificationsIsLoading,
    error: notificationsError,
    isError: notificationsIsError
  } = useUserNotifications(user.userId);

  if (isLoading || !userSettingsData || notificationsIsLoading || !notifications) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;
  if (notificationsIsError) return <ErrorPage error={notificationsError} message={notificationsError.message} />;

  const currentNotification = notifications.length > 0 ? notifications[0] : undefined;
  if (!currentNotification) return <LoadingIndicator />;

  return (
    <PageLayout title="Home" hidePageTitle>
      {currentNotification && <NotificationCard notification={currentNotification} />}
      <Typography variant="h3" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
        Welcome, {user.firstName}!
      </Typography>
    </PageLayout>
  );
};

export default AdminHomePage;
