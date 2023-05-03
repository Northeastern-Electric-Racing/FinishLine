import { Redirect, Route, Switch } from 'react-router-dom';
import { isAdmin } from 'shared';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAuth } from '../../hooks/auth.hooks';
import { routes } from '../../utils/routes';
import AdminToolsPage from './AdminToolsPage';

const AdminTools: React.FC = () => {
  const auth = useAuth();

  if (!auth.user) return <LoadingIndicator />;

  if (!isAdmin(auth.user.role)) {
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
