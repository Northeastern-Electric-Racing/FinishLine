/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography, Alert, Link } from '@mui/material';
import { useEffect, useState } from 'react';
import { routes } from '../../utils/routes';
import UsefulLinks from './UsefulLinks';
import WorkPackagesByTimelineStatus from './WorkPackagesByTimelineStatus';
import UpcomingDeadlines from './UpcomingDeadlines';
import { useCurrentUser, useSingleUserSettings } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

const Home = () => {
  const user = useCurrentUser();
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(user.userId);
  const { slackId: userSlackId } = userSettingsData || {};
  const [showAlert, setShowAlert] = useState(userSlackId === '');

  useEffect(() => {
    setShowAlert(userSlackId === '');
  }, [userSlackId]);

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  return (
    <>
      <Typography variant="h3" sx={{ my: 2, textAlign: 'center', pt: 3 }}>
        Welcome, {user.firstName}!
      </Typography>
      {showAlert ? (
        <Alert
          variant="filled"
          severity="warning"
          onClose={() => {
            setShowAlert(false);
          }}
        >
          You don't have a slack id set! Without it, you won't be able to get important updates from us. You can set it{' '}
          <Link href={routes.SETTINGS} sx={{ color: 'blue' }}>
            here
          </Link>
          .
        </Alert>
      ) : null}
      <UsefulLinks />
      <UpcomingDeadlines />
      <WorkPackagesByTimelineStatus />
    </>
  );
};

export default Home;
