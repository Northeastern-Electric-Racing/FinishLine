import { Redirect, Route, Switch } from 'react-router-dom';
import { isAdmin, isLeadership } from 'shared';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAuth } from '../../hooks/auth.hooks';
import { routes } from '../../utils/routes';
import AdminToolsPage from './AdminToolsPage';
import AdminToolsPageForLeadership from './AdminToolsPageForLeadership';

const AdminTools: React.FC = () => {
  const auth = useAuth();

  if (!auth.user) return <LoadingIndicator />;

  if (!isLeadership(auth.user.role)) {
    return (
      <Redirect
        to={{
          pathname: routes.HOME
        }}
      />
    );
  }

  if (!isAdmin(auth.user.role) && isLeadership(auth.user.role)) {
    return (
      <Switch>
        <Route path={routes.ADMIN_TOOLS} component={AdminToolsPageForLeadership} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path={routes.ADMIN_TOOLS} component={AdminToolsPage} />
    </Switch>
  );
};

export default AdminTools;
