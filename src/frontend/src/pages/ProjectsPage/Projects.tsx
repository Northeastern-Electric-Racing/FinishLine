/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import ProjectsTable from './ProjectsTable';
import WBSDetails from '../WBSDetails';
import CreateProjectForm from '../CreateProjectPage/CreateProjectForm';
import CreateWPForm from '../CreateWorkPackagePage/CreateWPForm';

const Projects: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.WORK_PACKAGE_NEW} component={CreateWPForm} />
      <Route path={routes.PROJECTS_NEW} component={CreateProjectForm} />
      <Route path={routes.PROJECTS_BY_WBS} component={WBSDetails} />
      <Route path={routes.PROJECTS} component={ProjectsTable} />
    </Switch>
  );
};

export default Projects;
