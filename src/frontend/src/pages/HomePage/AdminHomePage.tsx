/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography } from '@mui/material';
import { useSingleUserSettings } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout from '../../components/PageLayout';
import { AuthenticatedUser, wbsPipe } from 'shared';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import WorkPackageCard from './components/WorkPackageCard';

interface AdminHomePageProps {
  user: AuthenticatedUser;
}

const AdminHomePage = ({ user }: AdminHomePageProps) => {
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(user.userId);
  const { data: workPackages, isError: wpIsError, isLoading: wpLoading, error: wpError } = useAllWorkPackages();

  if (isLoading || !userSettingsData) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
        Welcome, {user.firstName}!
      </Typography>
      {(workPackages?.map((wp) => <WorkPackageCard key={wbsPipe(wp.wbsNum)} wp={wp} />))}

    </PageLayout>
  );
};

export default AdminHomePage;
