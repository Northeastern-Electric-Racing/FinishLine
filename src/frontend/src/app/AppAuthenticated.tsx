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
import NavTopBar from '../layouts/NavTopBar/NavTopBar';
import Settings from '../pages/SettingsPage/Settings';
import InfoPage from '../pages/InfoPage';
import Sidebar from '../layouts/Sidebar/Sidebar';
import { Container } from '@mui/material';
import Teams from '../pages/TeamsPage/Teams';
import AdminTools from '../pages/AdminToolsPage/AdminTools';

const styles = {
  content: {
    marginTop: '4rem',
    marginLeft: '85px'
  }
};

const AppAuthenticated: React.FC = () => {
  return (
    <>
      <NavTopBar />
      <div>
        <Sidebar />
        <div style={styles.content}>
          <Container maxWidth={false} sx={{ p: 1 }}>
            <Switch>
              <Route path={routes.PROJECTS} component={Projects} />
              <Redirect from={routes.CR_BY_ID} to={routes.CHANGE_REQUESTS_BY_ID} />
              <Route path={routes.CHANGE_REQUESTS} component={ChangeRequests} />
              <Route path={routes.TEAMS} component={Teams} />
              <Route path={routes.SETTINGS} component={Settings} />
              <Route path={routes.ADMIN_TOOLS} component={AdminTools} />
              <Route path={routes.INFO} component={InfoPage} />
              <Route exact path={routes.HOME} component={Home} />
              <Route path="*" component={PageNotFound} />
            </Switch>
          </Container>
        </div>
      </div>
    </>
  );
};

export default AppAuthenticated;
