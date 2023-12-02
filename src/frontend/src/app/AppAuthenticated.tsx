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
import Settings from '../pages/SettingsPage/Settings';
import InfoPage from '../pages/InfoPage';
import GanttPageWrapper from '../pages/GanttPage/GanttPageWrapper';
import Teams from '../pages/TeamsPage/Teams';
import AdminTools from '../pages/AdminToolsPage/AdminTools';
import Credits from '../pages/CreditsPage/Credits';
import AppContextUser from './AppContextUser';
import { useSingleUserSettings } from '../hooks/users.hooks';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorPage from '../pages/ErrorPage';
import SetUserPreferences from '../pages/HomePage/SetUserPreferences';
import Finance from '../pages/FinancePage/Finance';
import { useState } from 'react';
import NavTopBar from '../layouts/NavTopBar/NavTopBar';
import Sidebar from '../layouts/Sidebar/Sidebar';
import { Box } from '@mui/system';
import { Container } from '@mui/material';

interface AppAuthenticatedProps {
  userId: number;
}

const AppAuthenticated: React.FC<AppAuthenticatedProps> = ({ userId }) => {
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(userId);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  if (isLoading || !userSettingsData) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  return userSettingsData.slackId ? (
    <AppContextUser>
      <NavTopBar />
      <Box display={'flex'}>
        <Sidebar handleDrawerClose={handleDrawerClose} handleDrawerOpen={handleDrawerOpen} open={drawerOpen} />
        <Container maxWidth={false}>
          <Switch>
            <Route path={routes.PROJECTS} component={Projects} />
            <Redirect from={routes.CR_BY_ID} to={routes.CHANGE_REQUESTS_BY_ID} />
            <Route path={routes.CHANGE_REQUESTS} component={ChangeRequests} />
            <Route path={routes.GANTT} component={GanttPageWrapper} />
            <Route path={routes.TEAMS} component={Teams} />
            <Route path={routes.SETTINGS} component={Settings} />
            <Route path={routes.ADMIN_TOOLS} component={AdminTools} />
            <Route path={routes.INFO} component={InfoPage} />
            <Route path={routes.CREDITS} component={Credits} />
            <Route path={routes.FINANCE} component={Finance} />
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
