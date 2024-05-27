import { Redirect, Route, Switch } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAuth } from '../../hooks/auth.hooks';
import { routes } from '../../utils/routes';
import AdminToolsPage from './AdminToolsPage';
import { canAccessAdminTools } from '../../utils/users';
import CreateWorkPackageTemplate from '../WorkPackageTemplateForm/CreateWorkPackageTemplate';

const AdminTools: React.FC = () => {
  const auth = useAuth();

  if (!auth.user) return <LoadingIndicator />;

  if (!canAccessAdminTools(auth.user)) {
    return (
      <Redirect
        to={{
          pathname: routes.HOME
        }}
      />
    );
  }

  return (
    <Switch>
      <Route path={routes.ADMIN_TOOLS} component={AdminToolsPage} />
      <Route path={routes.WORK_PACKAGE_TEMPLATE_NEW} component={CreateWorkPackageTemplate} />
    </Switch>
  );
};

export default AdminTools;
