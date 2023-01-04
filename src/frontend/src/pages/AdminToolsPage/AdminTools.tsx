import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import AdminToolsPage from './AdminToolsPage';

const AdminTools: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.ADMIN_TOOLS} component={AdminToolsPage} />
    </Switch>
  );
};

export default AdminTools;
