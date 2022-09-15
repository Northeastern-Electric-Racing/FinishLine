/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Redirect, Route, Switch } from 'react-router-dom';
import { routes } from '../utils/Routes';
import ChangeRequests from '../pages/ChangeRequestsPage/ChangeRequests';
import Projects from '../pages/ProjectsPage/Projects';
import { PageNotFound } from '../pages/PageNotFound';
import Home from '../pages/HomePage/Home';
import NavTopBar from '../layouts/NavTopBar/NavTopBar';
import Settings from '../pages/SettingsPage/Settings';
import InfoPage from '../pages/InfoPage';
import Sidebar from '../layouts/Sidebar/Sidebar';
import TeamsPage from '../pages/TeamsPage';

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
          <Switch>
            <Route path={routes.PROJECTS} component={Projects} />
            <Redirect from={routes.CR_BY_ID} to={routes.CHANGE_REQUESTS_BY_ID} />
            <Route path={routes.CHANGE_REQUESTS} component={ChangeRequests} />
            <Route path={routes.TEAMS} component={TeamsPage} />
            <Route path={routes.SETTINGS} component={Settings} />
            <Route path={routes.INFO} component={InfoPage} />
            <Route exact path={routes.HOME} component={Home} />
            <Route path="*" component={PageNotFound} />
          </Switch>
        </div>
      </div>
    </>
  );
};

export default AppAuthenticated;
