import { Redirect, Route, Switch } from 'react-router-dom';
import { RoleEnum } from 'shared';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAuth } from '../../hooks/auth.hooks';
import { routes } from '../../utils/routes';
import AdminToolsPage from './AdminToolsPage';

const AdminTools = () => {
  const auth = useAuth();

  if (!auth.user) return <LoadingIndicator />;

  if (auth.user.role !== RoleEnum.ADMIN && auth.user.role !== RoleEnum.APP_ADMIN) {
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
    </Switch>
  );
};

export default AdminTools;
