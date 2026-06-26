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
import GanttChartPage from '../pages/GanttPage/ProjectGanttChart/ProjectGanttChartPage';
import Teams from '../pages/TeamsPage/Teams';
import AdminTools from '../pages/AdminToolsPage/AdminTools';
import Credits from '../pages/CreditsPage/Credits';
import AppContextUser from './AppContextUser';
import { useSingleUserSettings } from '../hooks/users.hooks';
import LoadingIndicator from '../components/LoadingIndicator';
import SessionTimeoutAlert from './SessionTimeoutAlert';
import SetUserPreferences from '../pages/HomePage/components/SetUserPreferences';
import Finance from '../pages/FinancePage/Finance';
import ErrorPage from '../pages/ErrorPage';
import { Role, isGuest } from 'shared';
import { useCurrentOrganization } from '../hooks/organizations.hooks';
import { GlobalCarFilterProvider } from './AppGlobalCarFilterContext';
import Statistics from '../pages/StatisticsPage/Statistics';
import RetrospectiveGanttChartPage from '../pages/RetrospectivePage/Retrospective';
import Calendar from '../pages/CalendarPage/Calendar';
import GuestEventPage from '../pages/GuestEventPage/GuestEventPage';
import GuestInfoPage from '../pages/GuestInfoPage/GuestInfoPage';
import GuestSponsorsPage from '../pages/GuestSponsorsPage/GuestSponsorsPage';
import ProjectManagementPage from '../pages/ProjectManagementPage/ProjectManagementPage';
import SidebarLayout from '../layouts/SidebarLayout';

interface AppAuthenticatedProps {
  userId: string;
  userRole: Role;
  completedOnboarding: boolean;
}

const AppAuthenticated: React.FC<AppAuthenticatedProps> = ({ userId, userRole, completedOnboarding }) => {
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(userId);

  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();

  if (organizationIsError) {
    return <ErrorPage message={organizationError.message} />;
  }

  if (isLoading || !userSettingsData || !organization || organizationIsLoading) return <LoadingIndicator />;

  if (isError) {
    if ((error as Error).message === 'Authentication Failed: Invalid JWT!') {
      return <SessionTimeoutAlert />;
    }
    return <ErrorPage error={error as Error} message={(error as Error).message} />;
  }

  return (
    <GlobalCarFilterProvider>
      {userSettingsData.slackId || (isGuest(userRole) && !completedOnboarding) ? (
        <AppContextUser>
          <SidebarLayout>
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
              <Route path={routes.STATISTICS} component={Statistics} />
              <Route path={routes.HOME} component={Home} />
              <Route path={routes.RETROSPECTIVE} component={RetrospectiveGanttChartPage} />
              <Route path={routes.PROJECT_MANAGEMENT} component={ProjectManagementPage} />
              <Route path={routes.EVENTS} component={GuestEventPage} />
              <Route path={routes.SPONSORS} component={GuestSponsorsPage} />
              <Route path={routes.GUEST_INFO} component={GuestInfoPage} />
              <Redirect from={routes.BASE} to={routes.HOME} />
              <Route path="*" component={PageNotFound} />
            </Switch>
          </SidebarLayout>
        </AppContextUser>
      ) : (
        <SetUserPreferences userSettings={userSettingsData} />
      )}
    </GlobalCarFilterProvider>
  );
};

export default AppAuthenticated;
