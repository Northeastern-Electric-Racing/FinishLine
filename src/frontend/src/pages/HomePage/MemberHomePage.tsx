/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Grid, Typography } from '@mui/material';
import { useSingleUserSettings } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout, { PAGE_GRID_HEIGHT } from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import MyTasks from './components/MyTasks';
import TeamWorkPackageDisplay from './components/TeamWorkPackageDisplay';
import GeneralAnnouncements from './components/GeneralAnnouncements';

interface MemberHomePageProps {
  user: AuthenticatedUser;
}

const MemberHomePage = () => {
  const user = useCurrentUser();
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(user.userId);
  const { setCurrentHomePage } = useHomePageContext();

  useEffect(() => {
    setCurrentHomePage('member');
  }, [setCurrentHomePage]);

  if (isLoading || !userSettingsData) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
        Welcome, {user.firstName}!
      </Typography>
      <Grid container height={`${PAGE_GRID_HEIGHT}vh`} mt={1} spacing={2}>
        <Grid item xs={12} md={6} height={'100%'}>
          <MyTasks />
        </Grid>
        <Grid item xs={12} md={6} height={'100%'}>
          <Box
            height={'100%'}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Box height={'49%'}>
              <GeneralAnnouncements />
            </Box>
            <Box height={'49%'}>
              <TeamWorkPackageDisplay user={user} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default MemberHomePage;
