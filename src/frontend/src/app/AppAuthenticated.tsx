/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Redirect, Route, Switch } from 'react-router-dom';
import { routes } from '../utils/routes';
import ChangeRequests from '../pages/ChangeRequestsPage/ChangeRequests';
import Projects from '../pages/ProjectsPage/Projects';
import { PageNotFound } from '../pages/PageNotFound';
import Home from '../pages/HomePage/Home';
import Settings from '../pages/SettingsPage/SettingsPage';
import InfoPage from '../pages/InfoPage';
import GanttChartPage from '../pages/GanttPage/GanttChartPage';
import Teams from '../pages/TeamsPage/Teams';
import AdminTools from '../pages/AdminToolsPage/AdminTools';
import Credits from '../pages/CreditsPage/Credits';
import AppContextUser from './AppContextUser';
import { useSingleUserSettings } from '../hooks/users.hooks';
import LoadingIndicator from '../components/LoadingIndicator';
import SessionTimeoutAlert from './SessionTimeoutAlert';
import SetUserPreferences from '../pages/HomePage/components/SetUserPreferences';
import Finance from '../pages/FinancePage/Finance';
import Sidebar from '../layouts/Sidebar/Sidebar';
import { Box } from '@mui/system';
import { Container, IconButton, useTheme } from '@mui/material';
import ErrorPage from '../pages/ErrorPage';
import { Role, isGuest } from 'shared';
import Calendar from '../pages/CalendarPage/Calendar';
import { useState } from 'react';
import ArrowCircleRightTwoToneIcon from '@mui/icons-material/ArrowCircleRightTwoTone';
import HiddenContentMargin from '../components/HiddenContentMargin';
import emitter from './EventBus';
import { useHomePageContext } from './HomePageContext';

interface AppAuthenticatedProps {
  userId: string;
  userRole: Role;
}

const AppAuthenticated: React.FC<AppAuthenticatedProps> = ({ userId, userRole }) => {
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(userId);

  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moveContent, setMoveContent] = useState(false);
  const { onPNMHomePage, onGuestHomePage } = useHomePageContext();

  if (isLoading || !userSettingsData) return <LoadingIndicator />;

  if (isError) {
    if ((error as Error).message === 'Authentication Failed: Invalid JWT!') {
      return <SessionTimeoutAlert />;
    }
    return <ErrorPage error={error as Error} message={(error as Error).message} />;
  }

  return userSettingsData.slackId || isGuest(userRole) ? (
    <AppContextUser>
      <Box
        onMouseEnter={() => {
          setDrawerOpen(true);
        }}
        sx={{
          height: '100vh',
          position: 'fixed',
          width: 15,
          borderRight: !onGuestHomePage ? 2 : 0,
          borderRightColor: theme.palette.background.paper
        }}
      />
      {!onGuestHomePage && (
        <>
          <IconButton
            onClick={() => {
              setDrawerOpen(true);
              setMoveContent(true);
            }}
            sx={{ position: 'fixed', left: -8, top: '3%' }}
          >
            <ArrowCircleRightTwoToneIcon
              sx={{
                fontSize: '30px',
                zIndex: 1,
                '& path:first-of-type': { color: '#000000' },
                '& path:last-of-type': { color: '#ef4345' }
              }}
            />
          </IconButton>
          <Sidebar
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            moveContent={moveContent}
            setMoveContent={setMoveContent}
            onPNMHomePage={onPNMHomePage}
          />
        </>
      )}
      <Box display={'flex'}>
        <HiddenContentMargin open={moveContent} variant="permanent" />
        <Container maxWidth={false} sx={{ width: moveContent ? 'calc(100vw - 220px)' : `calc(100vw - 30px)` }}>
          <Switch>
            <Route path={routes.PROJECTS} component={Projects} />
            <Redirect from={routes.CR_BY_ID} to={routes.CHANGE_REQUESTS_BY_ID} />
            <Route path={routes.CHANGE_REQUESTS} component={ChangeRequests} />
            <Route path={routes.GANTT} component={GanttChartPage} />
            <Route path={routes.TEAMS} component={Teams} />
            <Route path={routes.SETTINGS} component={Settings} />
            <Route path={routes.ADMIN_TOOLS} component={AdminTools} />
            <Route path={routes.INFO} component={InfoPage} />
            <Route path={routes.CREDITS} component={Credits} />
            <Route path={routes.FINANCE} component={Finance} />
            <Route path={routes.CALENDAR} component={Calendar} />
            <Route exact path={routes.HOME} component={Home} />
            <Route path="*" component={PageNotFound} />
          </Switch>
        </Container>
      </Box>
    </AppContextUser>
  ) : (
    <SetUserPreferences userSettings={userSettingsData} />
  );
};

export default AppAuthenticated;
