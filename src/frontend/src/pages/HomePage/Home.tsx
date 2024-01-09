/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography, Alert, Link } from '@mui/material';
import { routes } from '../../utils/routes';
import UsefulLinks from './UsefulLinks';
import WorkPackagesByTimelineStatus from './WorkPackagesByTimelineStatus';
import UpcomingDeadlines from './UpcomingDeadlines';
import { useCurrentUser, useSingleUserSettings } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHistory } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';

const Home = () => {
  const user = useCurrentUser();
  const history = useHistory();
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(user.userId);

  if (isLoading || !userSettingsData) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" sx={{ marginTop: 0, textAlign: 'center', pt: 3, padding: 0 }}>
        Welcome, {user.firstName}!
      </Typography>
      {!userSettingsData?.slackId && (
        <Alert variant="filled" severity="warning" onClose={() => history.push(routes.SETTINGS)}>
          You don't have a slack id set! Without it, you won't be able to get important updates from us. You can set it{' '}
          <Link href={routes.SETTINGS} sx={{ color: 'blue' }}>
            here
          </Link>
          .
        </Alert>
      )}
      <UsefulLinks />
      <UpcomingDeadlines />
      <WorkPackagesByTimelineStatus />
    </PageLayout>
  );
};

export default Home;
