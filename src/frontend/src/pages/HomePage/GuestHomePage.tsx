/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import { useSingleUserSettings } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout, { PAGE_GRID_HEIGHT } from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import MemberEncouragement from './components/MemberEncouragement';
import GuestOrganizationInfo from './components/GuestOrganizationInfo';
import FeaturedProjects from './components/FeaturedProjects';

interface GuestHomePageProps {
  user: AuthenticatedUser;
}

const GuestHomePage = ({ user }: GuestHomePageProps) => {
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(user.userId);

  if (isLoading || !userSettingsData) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
        Welcome, {user.firstName}!
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          height: `${PAGE_GRID_HEIGHT}vh`,
          mt: 2
        }}
      >
        <Box height={'45%'}>
          <GuestOrganizationInfo />
        </Box>
        <Box height={'15%'}>
          <MemberEncouragement />
        </Box>
        <Box height={'45%'}>
          <FeaturedProjects />
        </Box>
      </Box>
    </PageLayout>
  );
};

export default GuestHomePage;
