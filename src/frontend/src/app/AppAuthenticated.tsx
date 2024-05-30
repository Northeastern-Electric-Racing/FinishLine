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
import SetUserPreferences from '../pages/HomePage/SetUserPreferences';
import Finance from '../pages/FinancePage/Finance';
import Sidebar from '../layouts/Sidebar/Sidebar';
import { Box } from '@mui/system';
import { Container, IconButton } from '@mui/material';
import ErrorPage from '../pages/ErrorPage';
import { Role, isGuest } from 'shared';
import Calendar from '../pages/CalendarPage/Calendar';
import { useState } from 'react';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';

interface AppAuthenticatedProps {
  userId: string;
  userRole: Role;
}

const AppAuthenticated: React.FC<AppAuthenticatedProps> = ({ userId, userRole }) => {
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(userId);

  const [drawerOpen, setDrawerOpen] = useState(true);

  if (isLoading || !userSettingsData) return <LoadingIndicator />;

  if (isError) {
    if ((error as Error).message === 'Authentication Failed: Invalid JWT!') {
      return <SessionTimeoutAlert />;
    }
    return <ErrorPage error={error as Error} message={(error as Error).message} />;
  }

  return userSettingsData.slackId || isGuest(userRole) ? (
    <AppContextUser>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={() => setDrawerOpen(true)}
        sx={{
          position: 'fixed'
        }}
      >
        <ArrowForwardIosSharpIcon
          sx={{
            marginRight: -0.5,
            color: '#ffffff',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateX(3px)'
            }
          }}
        />
      </IconButton>
      <Box display={'flex'}>
        <Sidebar drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
        <Container maxWidth={false} sx={{ width: drawerOpen ? 'calc(100vw - 220px)' : 'calc(100vw - 40px)' }}>
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
