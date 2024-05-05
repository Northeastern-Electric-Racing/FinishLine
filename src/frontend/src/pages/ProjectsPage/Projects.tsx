/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import WBSDetails from '../WBSDetails';
import ProjectsPage from './ProjectsPage';
import CreateWorkPackageForm from '../WorkPackageForm/CreateWorkPackageForm';
import ProjectCreateContainer from '../ProjectDetailPage/ProjectForm/ProjectCreateContainer';
import CreateWorkPackageCRForm from '../WorkPackageForm/CreateWorkPackageCRForm';

const Projects: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.PROJECTS_OVERVIEW} component={ProjectsPage} />
      <Route path={routes.PROJECTS_ALL} component={ProjectsPage} />
      <Route path={routes.WORK_PACKAGE_NEW} component={CreateWorkPackageForm} />
      <Route path={routes.WORK_PACKAGE_CR_NEW} component={CreateWorkPackageCRForm} />
      <Route path={routes.PROJECTS_NEW} component={ProjectCreateContainer} />
      <Route path={routes.PROJECTS_BY_WBS} component={WBSDetails} />
      <Route path={routes.PROJECTS} component={ProjectsPage} />
    </Switch>
  );
};

export default Projects;
